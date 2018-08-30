#!/usr/bin/env python3

from eth.peer_count import *
import sys
from io import StringIO
from contextlib import contextmanager
import unittest

class TestOutputMethods(unittest.TestCase):

    def test_metrics_output(self):
        output = StringIO()

        output_values(output.write, lambda h, p: 42)

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
