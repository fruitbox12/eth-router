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

def usage(out=print):
    out("Munin plugin to report {0}".format(title))
    out("")
    out("./peer_count.py config - Display munin chart params")
    out("./peer_count.py - Fetch values and print to screen")

def output_config(out=print):
    out("graph_title {0}".format(title))
    out("plugins.label {0}".format(description))

def output_values(out=print, fetch=urlopen):
    numberOfPeers = ""
    try:
        req = Request(rpcHttpEndpoint, rpcPayload.encode())
        req.add_header("Content-Type", "application/json")
        numberOfPeers = loads(fetch(req).read().decode()).get('result')
    except ConnectionRefusedError:
        pass
    except URLError:
        pass
    out("plugins.value {0}".format(int(numberOfPeers, 16)))

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
