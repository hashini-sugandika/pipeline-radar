#!/bin/bash
apt-get update -y
apt-get install -y curl wget git

curl -sfL https://get.k3s.io | sh -

systemctl enable k3s
systemctl start k3s

curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

mkdir -p /home/ubuntu/.kube
cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
chown -R ubuntu:ubuntu /home/ubuntu/.kube
chmod 600 /home/ubuntu/.kube/config

sed -i 's/127.0.0.1/0.0.0.0/g' /home/ubuntu/.kube/config

echo "PipelineRadar VM ready!" >> /var/log/startup.log
