#!/usr/bin/env python3

from eth.block_number import *
from io import StringIO 
from unittest import TestCase
from unittest import main as unittestMain
from unittest.mock import Mock, patch

class TestOutputMethods(TestCase):

    @patch('sys.stdout', new_callable=StringIO)
    def test_usage(self, mock_stdout):
        usage()

        self.assertEqual("Munin plugin to report Geth Current Block\n\n./block_number.py config - Display munin chart params\n./block_number.py - Fetch values and print to screen",
            mock_stdout.getvalue().strip())

    @patch('eth.block_number.urlopen')
    def test_metrics_value(self, mock_urlopen):
        readMock = Mock()
        readMock.read.return_value = '{ "result": "0x2A" }'.encode() 
        mock_urlopen.return_value = readMock

        output = get_value("QSP")

        self.assertEqual("42",
            output)

    @patch('sys.stdout', new_callable=StringIO)
    @patch('eth.block_number.urlopen')
    def test_metrics_output(self, mock_urlopen, mock_stdout):
        readMock = Mock()
        readMock.read.return_value = '{ "result": "0x2A" }'.encode() 
        mock_urlopen.return_value = readMock

        output_values()

        self.assertEqual("QSP.value 42\nInfura.value 42\nEtherscan.value 42",
            mock_stdout.getvalue().strip())

    @patch('sys.stdout', new_callable=StringIO)
    def test_config_output(self, mock_stdout):
        output_config()

        self.assertEqual("graph_title Geth Current Block\ngraph_category Ethereum\nQSP.label Highest block on QSP\nInfura.label Highest block on Infura\nEtherscan.label Highest block on Etherscan",
            mock_stdout.getvalue().strip())

if __name__ == "__main__":
    unittestMain()
