# E-Commerce Website

## Project Goal
Design an online shopping website that which at least contains following services

* Item Service (including inventory service)
  * Use MongoDB to store item metadata, including unit price, item name, item picture
    urls, UPC (universal product code), item id.
  * Item service is also responsible for inventory lookup and update, by returning remaining
    available units of a product.

* Order Service
  * Use Cassandra to store order information
  * Supports both synchronous and asynchronous communications, it produces
    Kafka messages and also consumes kafka messages. 
  * Support order creation, update, cancellation and lookup (with ADMIN role)

* Account Service
  * Use MySQL for strong consistency of account data
  * Supports account creation, update and lookup (with ADMIN role)

* Payment Service
  * Use MySQL for strong consistency of payment data
  * Supports payment submission, update, refund and lookup (with ADMIN role)
  * Communicates with Order Service asynchronously via Kafka


## Docker
1. Build the Docker image (this runs the Maven build inside the container):
   ```
    docker compose up -d --build  
   ```
2. `http://localhost:8081/` Web UI for Demo, `http://localhost:8082/' UI for Kafka

3. Stop and remove containers, networks, images, and volumes:
   ```
    docker compose down -v
   ```
   
