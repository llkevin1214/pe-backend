"""
EV Charging Solution API Client Examples
Using Python
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional, Callable
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EVChargingClient:
    """EV Charging API Client"""
    
    def __init__(self, api_key: str, base_url: str = 'https://api.evcharging.abc.com/api/v1'):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'x-api-key': api_key,
            'Content-Type': 'application/json',
        })
        self.session.timeout = 10

    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Send HTTP request"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            logger.info(f"Sending request: {method.upper()} {url}")
            
            if method.upper() == 'GET':
                response = self.session.get(url)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            logger.info(f"Response successful: {response.status_code}")
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            raise

    def get_charger_status(self, charger_id: str) -> Dict[str, Any]:
        """
        Get charger status
        
        Args:
            charger_id: Charger ID
            
        Returns:
            Charger status information
        """
        endpoint = f"/chargers/{charger_id}/status"
        return self._make_request('GET', endpoint)

    def update_charger_status(self, charger_id: str, status_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update charger status
        
        Args:
            charger_id: Charger ID
            status_data: Status data
            
        Returns:
            Update result
        """
        endpoint = f"/chargers/{charger_id}/status"
        return self._make_request('PUT', endpoint, status_data)

    def control_charger(self, charger_id: str, action: str, options: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Control charger on/off
        
        Args:
            charger_id: Charger ID
            action: Action type (TURN_ON/TURN_OFF)
            options: Other options
            
        Returns:
            Control result
        """
        if options is None:
            options = {}
            
        control_data = {
            'action': action,
            'reason': options.get('reason'),
            'force': options.get('force', False),
        }
        
        endpoint = f"/chargers/{charger_id}/control"
        return self._make_request('POST', endpoint, control_data)

    def get_batch_charger_status(self) -> Dict[str, Any]:
        """
        Get batch charger status
        
        Returns:
            Batch status information
        """
        endpoint = "/chargers/batch/status"
        return self._make_request('GET', endpoint)

    def monitor_charger_status(self, charger_id: str, interval: int = 5000, 
                              callback: Optional[Callable] = None) -> None:
        """
        Monitor charger status changes
        
        Args:
            charger_id: Charger ID
            interval: Polling interval (milliseconds)
            callback: Status change callback function
        """
        last_status = None
        
        def check_status():
            nonlocal last_status
            try:
                status = self.get_charger_status(charger_id)
                
                if last_status and last_status.get('status') != status.get('status'):
                    logger.info(f"Charger {charger_id} status changed: {last_status.get('status')} -> {status.get('status')}")
                    if callback:
                        callback(status, last_status)
                
                last_status = status
                
            except Exception as e:
                logger.error(f"Failed to monitor charger status: {e}")
        
        # Check immediately once
        check_status()
        
        # Set timer
        while True:
            time.sleep(interval / 1000)  # Convert to seconds
            check_status()


class ChargerStatusMonitor:
    """Charger Status Monitor"""
    
    def __init__(self, client: EVChargingClient):
        self.client = client
        self.monitoring = False
        self.monitor_thread = None
    
    def start_monitoring(self, charger_ids: list, interval: int = 5000):
        """Start monitoring multiple chargers"""
        self.monitoring = True
        
        def monitor_loop():
            while self.monitoring:
                for charger_id in charger_ids:
                    try:
                        status = self.client.get_charger_status(charger_id)
                        logger.info(f"Charger {charger_id}: {status['status']}")
                    except Exception as e:
                        logger.error(f"Failed to get charger {charger_id} status: {e}")
                
                time.sleep(interval / 1000)
        
        import threading
        self.monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
        self.monitor_thread.start()
    
    def stop_monitoring(self):
        """Stop monitoring"""
        self.monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join()


def example_usage():
    """Usage example"""
    # Create client
    client = EVChargingClient('your-api-key-here')
    
    try:
        # 1. Get charger status
        logger.info("=== Get Charger Status ===")
        status = client.get_charger_status('CHARGER_001')
        logger.info(f"Charger status: {status}")
        
        # 2. Update charger status
        logger.info("\n=== Update Charger Status ===")
        update_data = {
            'status': 'CHARGING',
        }
        result = client.update_charger_status('CHARGER_001', update_data)
        logger.info(f"Update result: {result}")
        
        # 3. Control charger
        logger.info("\n=== Control Charger ===")
        control_result = client.control_charger('CHARGER_001', 'TURN_ON', {
            'reason': 'User requested charging',
            'force': False,
        })
        logger.info(f"Control result: {control_result}")
        
        # 4. Get batch status
        logger.info("\n=== Get Batch Status ===")
        batch_status = client.get_batch_charger_status()
        logger.info(f"Batch status: {batch_status}")
        
        # 5. Monitor status changes
        logger.info("\n=== Start Monitoring Status Changes ===")
        def status_change_callback(new_status, old_status):
            logger.info(f"Status changed: {old_status.get('status')} -> {new_status.get('status')}")
        
        # Note: This will block, should run in separate thread in actual use
        # client.monitor_charger_status('CHARGER_001', 3000, status_change_callback)
        
    except Exception as e:
        logger.error(f"Example execution failed: {e}")


def error_handling_example():
    """Error handling example"""
    client = EVChargingClient('invalid-api-key')
    
    try:
        client.get_charger_status('CHARGER_001')
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            logger.error("Authentication failed: Please check API key")
        elif e.response.status_code == 404:
            logger.error("Charger not found")
        elif e.response.status_code == 429:
            logger.error("Rate limit exceeded, please try again later")
        else:
            logger.error(f"HTTP error: {e.response.status_code}")
    except Exception as e:
        logger.error(f"Unknown error: {e}")


def batch_operations_example():
    """Batch operations example"""
    client = EVChargingClient('your-api-key-here')
    
    # Get status for multiple chargers in batch
    charger_ids = ['CHARGER_001', 'CHARGER_002', 'CHARGER_003']
    
    for charger_id in charger_ids:
        try:
            status = client.get_charger_status(charger_id)
            logger.info(f"{charger_id}: {status['status']}")
        except Exception as e:
            logger.error(f"Failed to get {charger_id} status: {e}")


if __name__ == "__main__":
    # Run examples
    example_usage()
    # error_handling_example()
    # batch_operations_example() 