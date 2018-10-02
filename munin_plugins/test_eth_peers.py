#!/usr/bin/env python3

from eth.peer_count import *
import sys
from io import StringIO, BytesIO
from unittest import TestCase
from unittest import main as unittestMain
from unittest.mock import Mock, patch

class TestOutputMethods(TestCase):

    @patch('sys.stdout', new_callable=StringIO)
    def test_usage(self, mock_stdout):
        usage()

        self.assertEqual("Munin plugin to report Geth Peers\n\n./peer_count.py config - Display munin chart params\n./peer_count.py - Fetch values and print to screen",
            mock_stdout.getvalue().strip())

    @patch('sys.stdout', new_callable=StringIO)
    @patch('eth.peer_count.urlopen')
    def test_metrics_output(self, mock_urlopen, mock_stdout):
        readMock = Mock()
        readMock.read.return_value = '{ "result": "0x2A" }'.encode()
        mock_urlopen.return_value = readMock

        output_values()

        self.assertEqual("peers.value 42",
            mock_stdout.getvalue().strip())

    @patch('sys.stdout', new_callable=StringIO)
    def test_config_output(self, mock_stdout):
        output_config()

        self.assertEqual("graph_title Geth Peers\npeers.label Number of connected peers\npeers.warning 3:\npeers.critical 1:",
            mock_stdout.getvalue().strip())

if __name__ == "__main__":
    unittestMain()
