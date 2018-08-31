#!/usr/bin/env python3

from eth.peer_count import *
import sys
from io import StringIO, BytesIO
import unittest

class TestOutputMethods(unittest.TestCase):

    def test_usage(self):
        output = StringIO()

        usage(output.write)

        output.seek(0)
        self.assertEqual("Munin plugin to report Geth Peers./peer_count.py config - Display munin chart params./peer_count.py - Fetch values and print to screen",
            output.read())

    def test_metrics_output(self):
        output = StringIO()

        mockOutput = BytesIO()
        mockOutput.write('{ "result": "0x2A" }'.encode())
        mockOutput.seek(0)
        mockCall = lambda r: mockOutput
        output_values(output.write, mockCall)

        output.seek(0)
        self.assertEqual("plugins.value 42",
            output.read())

    def test_config_output(self):
        output = StringIO()

        output_config(output.write)

        output.seek(0)
        self.assertEqual("graph_title Geth Peersplugins.label Number of connected peers",
            output.read())

if __name__ == "__main__":
    unittest.main()
