#!/usr/bin/env python3

try:
    import json
except ImportError:
    import simplejson as json

import sys
import urllib.request
import urllib.error

__version__ = "0.2.1"

class PagerDutyException(Exception):
    def __init__(self, status, message, errors):
        super(PagerDutyException, self).__init__(message)
        self.msg = message
        self.status = status
        self.errors = errors
    
    def __repr__(self):
        return "%s(%r, %r, %r)" % (self.__class__.__name__, self.status, self.msg, self.errors)
    
    def __str__(self):
        txt = "%s: %s" % (self.status, self.msg)
        if self.errors:
            txt += "\n" + "\n".join("* %s" % x for x in self.errors)
        return txt

class PagerDuty(object):
    def __init__(self, service_key, https=True, timeout=15):
        self.service_key = service_key
        self.api_endpoint = ("http", "https")[https] + "://events.pagerduty.com/generic/2010-04-15/create_event.json"
        self.timeout = timeout
    
    def trigger(self, description, incident_key=None, details=None):
        return self._request("trigger", description=description, incident_key=incident_key, details=details)
    
    def acknowledge(self, incident_key, description=None, details=None):
        return self._request("acknowledge", description=description, incident_key=incident_key, details=details)
    
    def resolve(self, incident_key, description=None, details=None):
        return self._request("resolve", description=description, incident_key=incident_key, details=details)
    
    def _request(self, event_type, **kwargs):
        event = {
            "service_key": self.service_key,
            "event_type": event_type,
        }
        for k, v in kwargs.items():
            if v is not None:
                event[k] = v
        encoded_event = json.dumps(event).encode()
        try:
            res = urllib.request.urlopen(self.api_endpoint, encoded_event, self.timeout)
        except urllib.error.HTTPError as exc:
            if exc.code != 400:
                raise
            res = exc
        
        result = json.loads(res.read().decode())
        
        if result['status'] != "success":
            raise PagerDutyException(result['status'], result['message'], result['errors'])
        
        # if result['warnings]: ...
        
        return result.get('incident_key')

def parse(txt):
    events = {}
    lines = [x.strip() for x in txt.split('\n') if x]
    it = iter(lines)
    line = next(it)
    while line:
        group, host, graph = line.split(' :: ')
        statuses = {}
        while True:
            try:
                line = next(it)
                if '::' in line:
                    break
            except StopIteration:
                line = None
                break

            status, rest = line.split(': ', 1)
            values = dict(
                x.split(' is ')
                for x in rest.rstrip('.').split(', ')
            )
            statuses[status.rstrip("s")] = values

        events[(group, host, graph)] = statuses
    return events

def main():
    service_key = "{{ pagerduty_integration_key }}"

    if len(sys.argv) == 2:
        service_key = sys.argv[1]

    alert = sys.stdin.read()
    hosts = parse(alert)

    pg = PagerDuty(service_key)
    for key, statuses in hosts.items():
        incident_key = "/".join(key)
        group, host, graph = key
        for status, values in statuses.items():
            for vname, value in values.items():
                description = "%(status)s [%(group)s/%(host)s :: %(graph)s] %(name)s is %(value)s" % \
                    dict(
                        status = status,
                        group = group,
                        host = host,
                        graph = graph,
                        name = vname,
                        value = value)
                if status == "OK":
                    pg.resolve(incident_key=incident_key, description=description)
                elif status == "WARNING":
                    pg.trigger(incident_key=incident_key, description=description)
                elif status == "CRITICAL":
                    pg.trigger(incident_key=incident_key, description=description)
                #elif status == "UNKNOWN":
                #    pg.trigger(incident_key=incident_key, description=description)

if __name__ == "__main__":
    main()

