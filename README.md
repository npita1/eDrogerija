# eDrogerija

**eDrogerija** is a simple e-commerce web application developed as part of my master's thesis focused on microservices containerization and orchestration.

## 🧩 Tech Stack

- **Backend:** Java Spring Boot (Microservice architecture)
- **Frontend:** React.js
- **Database:** MySQL (Database-per-service principle)
- **API Gateway:** Spring Cloud Gateway
- **Service Discovery:** Eureka
- **Containerization:** Docker
- **Orchestration:** Kubernetes (Minikube)

## 🧱 Microservices

- **Identity Service** – user authentication with JWT
- **Product Service** – product catalog and management
- **Cart Service** – shopping cart functionalities
- **Order Service** – order creation and tracking

## 💡 Features

- User registration and login
- Product browsing
- Add products to cart
- Create and view orders
- Admin dashboard for order management

## ⚙️ Deployment

The system is fully containerized with Docker and orchestrated using Kubernetes on a local Minikube cluster.

- Kubernetes deployment files can be found in the `/k8s` directory
- Frontend is built with Nginx and served via Kubernetes Ingress

## 🚀 How to Run (Locally)

To run this application locally, you need to have the following tools installed:

- [Docker](https://www.docker.com/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Minikube](https://minikube.sigs.k8s.io/docs/)

### 🧪 Steps:

1. **Start Minikube cluster**  
   ```bash
   minikube start
   ```

2. **Enable Ingress addon**  
   ```bash
   minikube addons enable ingress
   minikube addons enable ingress-dns
   ```

3. **Apply configuration files**  
   Apply the Kubernetes resources (ConfigMaps, Secrets, deployments, and services):

   ```bash
   kubectl apply -f k8s/configmaps.yaml
   kubectl apply -f k8s/secrets.yaml
   kubectl apply -f k8s/mysql/
   kubectl apply -f k8s/backend/
   kubectl apply -f k8s/frontend/
   ```
   
4. **Wait for pods to become ready**  
   It may take a few minutes for all pods, services, and deployments to initialize properly. You can check the status using:
   ```bash
   kubectl get pods
   ```

6. **Start Minikube tunnel**  
   ```bash
   minikube tunnel
   ```

7. **Access the application**  
   Navigate to [http://localhost](http://localhost) in your browser.

---


## 📄 About the Project

This project was developed for academic purposes as part of my master's thesis:  
**"Containerization and Orchestration of Microservices"**  
Faculty of Electrical Engineering, University of Sarajevo

