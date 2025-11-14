#!/bin/bash
set -euo pipefail

until mysql -hmysql -uchuwa -pChuwa12345 -e "USE ecommerce; SHOW TABLES LIKE 'users';" | grep -q users; do
  echo "waiting for users table..."
  sleep 5
done

mysql -hmysql -uchuwa -pChuwa12345 ecommerce <<'SQL'
INSERT INTO users (name,email,password,role) VALUES
  ('service','service_order@internal.local','$2y$10$quLHgQ3.GJRH8Xq5w9bOa.nM0BcJQAzqxScVmgyL5qnaggwVfH9yS','SERVICE_ORDER'),
  ('paymentadm','payment_admin@internal.local','$2y$10$MBc3FIamfSaBkLEnX99c9eC69ei3ujuzdIa83TqIo84Lg31YFzTOq','PAYMENT_ADMIN'),
  ('admin','admin@internal.local','$2y$10$4AyPku/3kiIVCKEB0sX1JOiJ5nfpABi706V2acLvXIbWDWbFghbki','ADMIN')
ON DUPLICATE KEY UPDATE role=VALUES(role);
SQL
