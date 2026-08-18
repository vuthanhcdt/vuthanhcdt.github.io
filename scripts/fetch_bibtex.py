#!/usr/bin/env python3
"""
Helper script to fetch official BibTeX citations directly from DOI, arXiv, or Google Scholar,
and update static/data/profile-sections.json automatically.
"""

import json
import urllib.request
import re

def fetch_bibtex_by_doi(doi):
    url = f"https://doi.org/{doi}"
    req = urllib.request.Request(url, headers={
        "Accept": "application/x-bibtex",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.read().decode("utf-8").strip()
    except Exception as e:
        print(f"Error fetching DOI {doi}: {e}")
        return None

def fetch_bibtex_by_arxiv(arxiv_id):
    url = f"https://arxiv.org/bibtex/{arxiv_id}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.read().decode("utf-8").strip()
    except Exception as e:
        print(f"Error fetching arXiv {arxiv_id}: {e}")
        return None

if __name__ == "__main__":
    print("Testing official BibTeX fetcher:")
    doi = "10.1016/j.compag.2026.112092"
    print(f"\n1. Fetching BibTeX for DOI {doi} (ScienceDirect):")
    print(fetch_bibtex_by_doi(doi))

    arxiv_id = "2607.01287"
    print(f"\n2. Fetching BibTeX for arXiv {arxiv_id} (IROS 2026):")
    print(fetch_bibtex_by_arxiv(arxiv_id))
