#!/usr/bin/env python3

from sys import argv
from urllib.request import urlopen, Request
from urllib.error import URLError
from json import loads

# TODO - templatize
rpcHttpEndpoint = "http://127.0.0.1:8547"

rpcPayload = '{"jsonrpc": "2.0", "method": "net_peerCount", "params": [], "id": 0}'

title = "Geth Peers"
description = "Number of connected peers"
category = "Ethereum"

def usage():
    print("Munin plugin to report {0}".format(title))
    print("")
    print("./peer_count.py config - Display munin chart params")
    print("./peer_count.py - Fetch values and print to screen")

def output_config():
    print("graph_title {0}".format(title))
    print("graph_category {0}".format(category))
    print("peers.label {0}".format(description))
    print("peers.warning 3:")
    print("peers.critical 1:")

def output_values():
    numberOfPeers = "0x0"
    try:
        req = Request(rpcHttpEndpoint, rpcPayload.encode())
        req.add_header("Content-Type", "application/json")
        numberOfPeers = loads(urlopen(req).read().decode()).get('result')
    except ConnectionRefusedError:
        pass
    except URLError:
        pass
    print("peers.value {0}".format(int(numberOfPeers, 16)))

if __name__ == "__main__":

    args = argv[1:]
    argslen = len(args)

    if argslen == 0:
        output_values()
    elif argslen == 1:
        if args[0] == "config":
            output_config()
        else:
            usage()
    else:
        usage()
