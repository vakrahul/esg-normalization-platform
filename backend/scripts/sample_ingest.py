#!/usr/bin/env python
"""POST sample CSVs and travel sync to a running API."""
import argparse
import os
import sys

try:
    import requests
except ImportError:
    print("Install requests: pip install requests")
    sys.exit(1)

BASE = os.getenv("API_BASE", "http://localhost:8000/api")
SAMPLES = os.path.join(os.path.dirname(__file__), "..", "..", "samples")


def login(session, username, password):
    session.get(f"{BASE}/auth/csrf/")
    r = session.post(f"{BASE}/auth/login/", json={"username": username, "password": password})
    r.raise_for_status()
    return r.json()


def upload(session, path, endpoint):
    with open(path, "rb") as f:
        r = session.post(f"{BASE}/imports/{endpoint}/", files={"file": f})
    r.raise_for_status()
    return r.json()


def travel_sync(session):
    r = session.post(f"{BASE}/imports/travel-sync/")
    r.raise_for_status()
    return r.json()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--username", default="analyst")
    parser.add_argument("--password", default="analyst123")
    args = parser.parse_args()

    session = requests.Session()
    login(session, args.username, args.password)

    sap = os.path.join(SAMPLES, "sap_budget_export.csv")
    util = os.path.join(SAMPLES, "utility_billing.csv")

    print("SAP:", upload(session, sap, "sap"))
    print("Utility:", upload(session, util, "utility"))
    print("Travel:", travel_sync(session))


if __name__ == "__main__":
    main()
