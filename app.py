import os
import re
import ssl
import urllib.request
import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template

app = Flask(__name__)

# Feed URL
FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def parse_feed_data(xml_data):
    # Parse XML data using ElementTree
    # Atom feeds use the namespace: http://www.w3.org/2005/Atom
    root = ET.fromstring(xml_data)
    namespaces = {'atom': 'http://www.w3.org/2005/Atom'}
    
    entries = []
    for entry_el in root.findall('atom:entry', namespaces):
        title_el = entry_el.find('atom:title', namespaces)
        title_text = title_el.text.strip() if title_el is not None and title_el.text else ""
        
        updated_el = entry_el.find('atom:updated', namespaces)
        updated_text = updated_el.text.strip() if updated_el is not None and updated_el.text else ""
        
        # Extract link
        link_el = entry_el.find('atom:link[@rel="alternate"]', namespaces)
        if link_el is None:
            link_el = entry_el.find('atom:link', namespaces)
        link_href = link_el.attrib.get('href', '') if link_el is not None else ''
        
        content_el = entry_el.find('atom:content', namespaces)
        content_html = content_el.text if content_el is not None and content_el.text else ""
        
        # Split release content by headings (e.g., <h3>Feature</h3>)
        items = []
        if content_html:
            # We split the HTML using <h3> tags as boundary markers
            # This allows treating each specific announcement/feature separately
            parts = re.split(r'(<h3>.*?</h3>)', content_html)
            # parts[0] is everything before the first <h3> (usually empty)
            # The remaining parts alternate between: [h3_tag, description_html, h3_tag, ...]
            for i in range(1, len(parts), 2):
                h3_tag = parts[i]
                desc_html = parts[i+1] if i+1 < len(parts) else ""
                
                # Extract clean type from <h3> tag (e.g., Feature, Issue, Announcement, Breaking)
                type_match = re.search(r'<h3>(.*?)</h3>', h3_tag)
                item_type = type_match.group(1).strip() if type_match else "Update"
                
                items.append({
                    'type': item_type,
                    'description': desc_html.strip(),
                    'raw_html': f"{h3_tag}\n{desc_html.strip()}"
                })
        
        # Fallback if splitting fails or no <h3> elements are present
        if not items and content_html:
            items.append({
                'type': 'Update',
                'description': content_html.strip(),
                'raw_html': content_html.strip()
            })
            
        entries.append({
            'date': title_text,
            'updated': updated_text,
            'link': link_href,
            'items': items
        })
        
    return entries

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/releases')
def get_releases():
    try:
        req = urllib.request.Request(
            FEED_URL,
            headers={'User-Agent': 'Mozilla/5.0 (BigQueryReleaseNotesViewer/1.0)'}
        )
        # Create unverified context to bypass SSL validation (fixes macOS root cert issues)
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=context, timeout=10) as response:
            xml_data = response.read()
            
        releases = parse_feed_data(xml_data)
        return jsonify({
            'success': True,
            'releases': releases
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Run the server locally on port 5001 to avoid default port 5000 conflicts
    app.run(host='0.0.0.0', port=5001, debug=True)
