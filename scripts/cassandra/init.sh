#!/bin/bash
echo "Waiting for Cassandra to be ready..."

# Wait until cqlsh works
until cqlsh cassandra 9042 -e "DESCRIBE KEYSPACES;" >/dev/null 2>&1; do
  echo "Cassandra not ready yet..."
  sleep 5
done

echo "Cassandra is up! Creating keyspace..."

cqlsh cassandra 9042 -e "
CREATE KEYSPACE IF NOT EXISTS ecommerce
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
"

echo "Keyspace created!"
