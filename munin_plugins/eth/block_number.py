#!/usr/bin/env python3

from sys import argv
from urllib.request import urlopen 
from urllib.error import URLError

# TODO - templatize
rpcHttpEndpoint = "http://127.0.0.1:8547"

rpcPayload = '{"jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 0}'

title = "Geth Current Block"
description = "The latest available block"

def usage(out=print):
    out("Munin plugin to report {0}".format(title))
    out("")
    out("./block_number.py config - Display munin chart params")
    out("./block_number.py - Fetch values and print to screen")

def output_config(out=print):
    out("graph_title {0}".format(title))
    out("plugins.label {0}".format(description))

def output_values(out=print, fetch=urlopen):
    currentBlock = ""
    try:
        currentBlock = fetch(rpcHttpEndpoint, rpcPayload.encode())
    except ConnectionRefusedError:
        pass
    except URLError:
        pass
    out("plugins.value {0}".format(currentBlock))

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
