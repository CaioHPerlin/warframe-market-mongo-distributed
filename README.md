# warframe-market-mongo-distributed

Simple Warframe Market domain simulation for a distributed MongoDB cluster: sharded architecture with Replica Sets, Docker Compose, and seed data from the real (and loved) warframe.market website.

## Topologia

> **@TODO**

**Total: 13 containers**: 3 config server + 9 nós de shard (3 por shard) + 1 mongos

## Como subir

```bash
docker compose up -d
```

O container `init-cluster` roda automaticamente e inicializa os Replica Sets, registra os shards e habilita sharding nas coleções.

Aguarde ~30 segundos e conecte ao cluster:

```bash
mongosh --port 27017
```

## Inspecionar o cluster

```bash
# estado completo do cluster: shards, chunks, coleções fragmentadas
sh.status()

# estado do Replica Set do shard 1: primary, secondaries, sincronização
mongosh --port 27017 --eval "
  db.adminCommand({ getShardMap: 1 })
"

# conectar direto num shard pra ver o rs.status()
mongosh --host localhost --port 27018
rs.status()
```

## Coleções e Shard Keys

A escolha de cada chave segue as categorias e diretrizes do MongoDB. A regra geral aplicada em todas as coleções foi a de cardinalidade: o particionamento tem melhor desempenho em campos de alta cardinalidade, e uma chave de baixa cardinalidade limita o número de chunks possíveis ao número de valores distintos do campo.

| Coleção        | Shard Key                         | Justificativa                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`        | `{ _id: "hashed" }`               | Catálogo consultado por ID específico, sem padrão de range query. Hash garante alta cardinalidade e pré-aloca os chunks distribuídos uniformemente entre os shards desde a criação da coleção, sem depender de volume acumulado para disparar split.                                                                                                                                                                                                                                                                |
| `players`      | `{ _id: "hashed" }`               | Mesmo raciocínio de `items`: cardinalidade máxima por `_id`, nenhuma consulta por intervalo de players no domínio. A limitação de chave hash (impossibilidade de range query direcionada) não pesa aqui porque essa consulta nunca é feita. Reputação é computada via `ratings`, não armazenada no documento do player.                                                                                                                                                                                             |
| `orders`       | `{ platform: 1, item_id: 1 }`     | `platform` sozinho teria cardinalidade muito baixa (4 valores possíveis: PC, PS4, Xbox, Switch), o que limitaria o cluster a no máximo 4 chunks. A chave composta resolve isso: `platform` agrupa logicamente por decisão de negócio, e `item_id` resgata a cardinalidade necessária para distribuição eficiente. Reflete a query mais comum do domínio, "ordens do item X na plataforma Y", como targeted query.                                                                                                   |
| `transactions` | `{ item_id: 1, completed_at: 1 }` | Evita o anti-pattern de chave ascendente: usar só `completed_at` concentraria todas as inserções no chunk mais recente (o "Max Chunk"), sobrecarregando um único shard enquanto os demais ficam ociosos. Colocar `item_id` primeiro dispersa o ponto de inserção entre múltiplos chunks desde o início. `completed_at` como segundo campo preserva a capacidade de range query por período dentro do histórico de um item, refletindo o índice mais usado no domínio: "histórico de preços do item X no período Y". |
| `ratings`      | não fragmentada                   | Decisão consciente de não aplicar sharding. O volume de gravação é baixo por natureza (um rating por par de players que já transacionaram, nunca repetido), então não há gargalo de throughput de leitura ou gravação a resolver, um dos critérios centrais para decidir se vale a pena fragmentar. Fragmentar aqui resultaria em chunks inertes em um único shard, sem benefício real.                                                                                                                             |

## Design Patterns aplicados

**Computed Pattern**, reputação do player não é armazenada como campo fixo. É derivada agregando os ratings (`positive`, `neutral`) na coleção `ratings` associados ao player. Evita inconsistência entre o campo armazenado e o valor real.

**Two Collection Pattern**, orders e transactions são coleções separadas porque têm ciclos de vida e queries distintos. Orders existem enquanto estão ativas; transactions são permanentes e servem o histórico de preços.

## Regra de negócio, Ratings

Um player só pode avaliar outro player uma única vez (unicidade pelo par `rater_id` + `rated_id`), com rating `positive` ou `neutral` e uma observação em texto. Essa regra evita abuso (avaliações repetidas) e justifica a existência de `ratings` como coleção própria, separada de `transactions`.

## Seed data

```bash
# em breve: script que consome a API pública do Warframe.Market
# GET https://api.warframe.market/v2/items
```
