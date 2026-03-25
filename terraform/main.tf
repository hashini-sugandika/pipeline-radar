terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "pipelineradar-491310-tfstate"
    prefix = "terraform/state"
  }
}

provider "google" {
  credentials = file("gcp-credentials.json")
  project     = var.project_id
  region      = var.region
  zone        = var.zone
}

resource "google_compute_instance" "pipeline_radar_vm" {
  name         = "pipeline-radar-vm"
  machine_type = "e2-micro"
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 30
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }

  metadata_startup_script = file("startup.sh")

  tags = ["pipeline-radar", "http-server", "https-server"]

  metadata = {
    ssh-keys = "ubuntu:${file("~/.ssh/pipeline-radar.pub")}"
  }
}

resource "google_compute_firewall" "allow_http" {
  name    = "allow-http-https"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "3000", "3001", "3002", "8080", "9090", "9093"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["pipeline-radar"]
}

output "vm_external_ip" {
  value       = google_compute_instance.pipeline_radar_vm.network_interface[0].access_config[0].nat_ip
  description = "External IP of the PipelineRadar VM"
}
