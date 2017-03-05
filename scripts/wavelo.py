import requests
import yaml
import datetime, time
import os
import argparse

parser = argparse.ArgumentParser(description='wavelo usage data collector')
parser.add_argument('-o', '--output_folder', nargs=1, default=['.'], type=str, help='folder in which outpud data are saved', dest='path_to_output_dir')
args = parser.parse_args()

path_to_output_dir  = args.path_to_output_dir[0]

if not os.path.exists(path_to_output_dir):
    raise SystemExit('Path %s does not exist.' %(path_to_output_dir))
if not os.path.isdir(path_to_output_dir):
    raise SystemExit('Path %s is not a directory.' %(path_to_output_dir))

data_file = 'wavelo_data.yaml'
data_file_summary = 'wavelo_data_summary.yaml'

network_id = 105 #Wavelo network id
server = 'https://app.socialbicycles.com/api/'
hubs_endpoint = 'networks/%d/hubs.json'%(network_id)
bikes_endpoint = 'networks/%d/bikes.json?per_page=300'%(network_id)

user = os.environ['SOCIALB_USER']
password = os.environ['SOCIALB_PASSWORD']

curr_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
timestamp = time.time()

hubs_data = {}
bikes_data = {}

data_summary = {
    curr_time : {
        'timestamp' : timestamp,
    }
}

#Hubs data
all_available_bikes_hubs = 0
all_current_bikes_hubs = 0

r = requests.get(server + hubs_endpoint, auth=(user, password))
hubs = r.json()['items']

for hub in hubs:
    keys = ['id', 'name', 'available_bikes', 'current_bikes', 'free_racks']
    hub_data = { key: hub[key] for key in keys }

    all_available_bikes_hubs += hub['available_bikes']
    all_current_bikes_hubs += hub['current_bikes']
    hubs_data[hub_data['id']] = hub_data

data_summary[curr_time]['all_available_bikes_hubs'] = all_available_bikes_hubs
data_summary[curr_time]['all_current_bikes_hubs'] = all_current_bikes_hubs

#Bikes data
all_state_not_available = 0
all_repair_state_not_working = 0
all_not_in_hub = 0
all_outside_area = 0

r = requests.get(server + bikes_endpoint, auth=(user, password))
bikes = r.json()['items']
all_available_bikes = r.json()['total_entries']

for bike in bikes:
    keys = ['id', 'name', 'hub_id', 'state', 'repair_state', 'distance', 'inside_area']
    bike_data = { key: bike[key] for key in keys }

    if bike['state'] != 'available':
        all_state_not_available += 1
    if bike['repair_state'] != 'working':
        all_repair_state_not_working += 1
    if bike['hub_id'] == None:
        all_not_in_hub += 1
    if bike['inside_area'] == False:
        all_outside_area += 1
    
    bikes_data[bike_data['id']] = bike_data

data_summary[curr_time]['all_state_not_available'] = all_state_not_available
data_summary[curr_time]['all_repair_state_not_working'] = all_repair_state_not_working
data_summary[curr_time]['all_not_in_hub'] = all_not_in_hub
data_summary[curr_time]['all_available_bikes'] = all_available_bikes
data_summary[curr_time]['all_outside_area'] = all_outside_area


with open(os.path.join(path_to_output_dir, data_file_summary), 'a') as outfile:
    yaml.safe_dump(data_summary, outfile, encoding='utf-8', default_flow_style=False, allow_unicode=True)

data_summary[curr_time]['hubs'] = hubs_data
data_summary[curr_time]['bikes'] = bikes_data

with open(os.path.join(path_to_output_dir, data_file), 'a') as outfile:
    yaml.safe_dump(data_summary, outfile, encoding='utf-8', default_flow_style=False, allow_unicode=True)

