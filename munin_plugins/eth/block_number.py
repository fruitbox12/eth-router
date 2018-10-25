#!/usr/bin/env python3

from sys import argv
from urllib.request import Request, urlopen
from urllib.error import URLError
from json import loads

qspDefault = "http://127.0.0.1:8547"
infuraDefault = "{{ infura_rpc_string }}"
etherscanDefault = "{{ etherscan_rpc_string }}"

rpcHttpEndpoints = {
    "QSP" :  qspDefault,
    "Infura" : infuraDefault,
    "Etherscan" : etherscanDefault
}

rpcPayload = '{"jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 0}'

title = "Geth Current Block"
description = "The latest available block"
category = "Ethereum"

def usage():
    print("Munin plugin to report {0}".format(title))
    print("")
    print("./block_number.py config - Display munin chart params")
    print("./block_number.py - Fetch values and print to screen")

def output_config():
    print("graph_title {0}".format(title))
    print("graph_category {0}".format(category))
    print("graph_printf %.6lf")
    endpoints = ["{0}.label Highest block on {0}".format(h) for h in rpcHttpEndpoints.keys()]
    print("\n".join(endpoints))

def get_value(rpcHost="QSP"):
    currentBlock = "0x0"
    try:
        req = Request(rpcHttpEndpoints[rpcHost], rpcPayload.encode())
        req.add_header("Content-Type", "application/json")
        currentBlock = loads(urlopen(req).read().decode()).get('result')
    except ConnectionRefusedError:
        pass
    except URLError:
        pass
    return "{0}".format(int(currentBlock, 16))

def output_values():
    hosts = rpcHttpEndpoints.keys()
    values = [get_value(h) for h in hosts]
    outputValues = ["{0}.value {1}".format(h, v) for h, v in zip(hosts, values)]
    print("\n".join(outputValues))

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
