from flask import Flask, request, jsonify
import pdfplumber
import spacy
import re
import requests
from enum import Enum
from io import BytesIO

app = Flask(__name__)


def extract_text_with_pdfplumber(pdf_bytes):
    text = ""
    with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            text += page.extract_text()
    return text

import re

def identify_vulnerabilities(text):
    vulnerabilities = {
        'pii': [],
        'financial': [],
        'confidential': [],
        'technical': [],
        'medical': [],
        'legal': [],
        'authentication': [],
        'network': [],
        'encryption': [],
        'location': [],
        'source_code': []
    }

    # Expanded patterns for different types of vulnerabilities
    patterns = {
        # PII (Personally Identifiable Information)
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'aadhaar': r'\b\d{4}\s\d{4}\s\d{4}\b',
        'phone': r'\b(\+91[\s-]?)?[789]\d{9}\b',
        'pan_card': r'\b[A-Z]{5}\d{4}[A-Z]\b',
        'voter_id': r'\b[A-Z0-9]{10}\b',

        # Financial Information
        'credit_card': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
        'bank_account': r'\b\d{9,18}\b',
        'ifsc_code': r'\b[A-Z]{4}0[A-Z0-9]{6}\b',

        # Technical Information
        'ip_address': r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b',

        # Medical Information
        'medical_record_number': r'\bMRN:\s?\d{7}\b',

        # Legal Information
        'legal_case_number': r'\b\d{2}-CV-\d{5}\b',

        # Authentication Credentials
        'api_key': r'\bAPI_KEY=[A-Za-z0-9]+\b',
        'password': r'\bpassword:\s?[A-Za-z0-9]+\b',

        # Confidential Information
        'trade_secret': r'\btrade secret\b'
    }

    for key, pattern in patterns.items():
        matches = re.findall(pattern, text)
        if key in ['email', 'aadhaar', 'phone', 'pan_card', 'voter_id']:
            vulnerabilities['pii'].extend(matches)
        elif key in ['credit_card', 'bank_account', 'ifsc_code']:
            vulnerabilities['financial'].extend(matches)
        elif key == 'ip_address':
            vulnerabilities['technical'].extend(matches)
        elif key == 'medical_record_number':
            vulnerabilities['medical'].extend(matches)
        elif key == 'legal_case_number':
            vulnerabilities['legal'].extend(matches)
        elif key in ['api_key', 'password']:
            vulnerabilities['authentication'].extend(matches)
        elif key == 'trade_secret':
            vulnerabilities['confidential'].extend(matches)

    return vulnerabilities

# Function to categorize vulnerabilities based on severity
class Severity(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

def categorize_vulnerabilities(vulnerabilities):
    categorized = []
    for category, items in vulnerabilities.items():
        for item in items:
            if category == 'pii':
                if '@' in item:
                    categorized.append({
                        'type': 'Personal Email Address',
                        'value': item,
                        'severity': Severity.MEDIUM.name,
                        'impact': 'Potential for targeted phishing attacks'
                    })
                elif '-' in item and len(item) == 11:
                    categorized.append({
                        'type': 'Social Security Number',
                        'value': item,
                        'severity': Severity.CRITICAL.name,
                        'impact': 'High risk of identity theft'
                    })
                else:
                    categorized.append({
                        'type': 'Other PII',
                        'value': item,
                        'severity': Severity.HIGH.name,
                        'impact': 'Potential for identity theft or privacy violation'
                    })
            elif category == 'financial':
                categorized.append({
                    'type': 'Financial Data',
                    'value': item,
                    'severity': Severity.CRITICAL.name if 'credit_card' in item else Severity.HIGH.name,
                    'impact': 'Financial fraud risk'
                })
            elif category == 'technical':
                categorized.append({
                    'type': 'Technical Information',
                    'value': item,
                    'severity': Severity.MEDIUM.name,
                    'impact': 'Potential for network intrusion'
                })

    return categorized

# Flask route for processing PDF from IPFS link
@app.route('/api/testVF', methods=['POST'])
def process_ipfs_pdf():
    data = request.json
    if not data or 'ipfs_link' not in data:
        return jsonify({"error": "No IPFS link provided"}), 400

    ipfs_link = data['ipfs_link']
    
    try:
        # Fetch PDF from IPFS link
        response = requests.get(ipfs_link)
        response.raise_for_status()
        pdf_bytes = response.content

        # Extract text and process vulnerabilities
        extracted_text = extract_text_with_pdfplumber(pdf_bytes)
        print(extracted_text)
        vulnerabilities = identify_vulnerabilities(extracted_text)

        # Extract unique 'type' values from categorized vulnerabilities
        print(vulnerabilities)
        # Directly return the unique types as a JSON array
        return jsonify(vulnerabilities)

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to fetch PDF: {e}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def main_func(input_pdf_path, vulnerabilities, severity_index, file_type, username, unique_id):

  ## Distributing Vulnerabilities into categories :

  ### Imported from Sachin's Code
  severity_index = severity_index * 20

  from enum import Enum

  class Severity(Enum):
      LOW = 1
      MEDIUM = 2
      HIGH = 3
      CRITICAL = 4

  def categorize_vulnerabilities(vulnerabilities):
      categorized = []

      for category, items in vulnerabilities.items():
          for item in items:
              if category == 'pii':
                  if '@' in item:
                      categorized.append({
                          'type': 'Personal Email Address',
                          'value': item,
                          'severity': Severity.MEDIUM,
                          'impact': 'Potential for targeted phishing attacks'
                      })
                  elif '-' in item and len(item) == 11:
                      categorized.append({
                          'type': 'Social Security Number',
                          'value': item,
                          'severity': Severity.CRITICAL,
                          'impact': 'High risk of identity theft'
                      })
                  else:
                      categorized.append({
                          'type': 'Other PII',
                          'value': item,
                          'severity': Severity.HIGH,
                          'impact': 'Potential for identity theft or privacy violation'
                      })

              elif category == 'financial':
                  if len(item) in [15, 16]:
                      categorized.append({
                          'type': 'Credit Card Number',
                          'value': item,
                          'severity': Severity.CRITICAL,
                          'impact': 'Financial fraud risk'
                      })
                  else:
                      categorized.append({
                          'type': 'Financial Account Number',
                          'value': item,
                          'severity': Severity.HIGH,
                          'impact': 'Risk of financial loss or fraud'
                      })

              elif category == 'confidential':
                  categorized.append({
                      'type': 'Confidential Business Information',
                      'value': item,
                      'severity': Severity.HIGH,
                      'impact': 'Potential loss of competitive advantage or legal issues'
                  })

              elif category == 'technical':
                  if '.' in item and len(item.split('.')) == 4:
                      categorized.append({
                          'type': 'IP Address',
                          'value': item,
                          'severity': Severity.MEDIUM,
                          'impact': 'Potential for network intrusion'
                      })
                  elif item.startswith('password'):
                      categorized.append({
                          'type': 'Password',
                          'value': item,
                          'severity': Severity.CRITICAL,
                          'impact': 'Direct system access risk'
                      })
                  else:
                      categorized.append({
                          'type': 'Technical Detail',
                          'value': item,
                          'severity': Severity.MEDIUM,
                          'impact': 'Potential for system exploitation'
                      })

              elif category == 'medical':
                  categorized.append({
                      'type': 'Medical Information',
                      'value': item,
                      'severity': Severity.HIGH,
                      'impact': 'HIPAA violation risk and privacy concerns'
                  })

              elif category == 'legal':
                  categorized.append({
                      'type': 'Legal Information',
                      'value': item,
                      'severity': Severity.MEDIUM,
                      'impact': 'Potential breach of confidentiality or legal ethics'
                  })

              elif category == 'authentication':
                  categorized.append({
                      'type': 'Authentication Credential',
                      'value': item,
                      'severity': Severity.CRITICAL,
                      'impact': 'Direct system access risk'
                  })

      return categorized


  # Function to exactly take out part of the pdf which we want to mask based on Severity Index too.
  """
      Input : Vulnerabilties in a list of dictionaries
              Severity Index (20,40,60,80)


      Ouput : Array of words to be masked
  """

  def mask_categories(vulnerabilities, category):

    to_mask = []

    categorized_vulnerabilities = categorize_vulnerabilities(vulnerabilities)
    for vuln in categorized_vulnerabilities:
      if(vuln['severity'].name == 'CRITICAL'):
        to_mask += [vuln['value']]

      if((vuln['severity'].name == 'HIGH') and (category >= 40)):
        to_mask += [vuln['value']]


      if(vuln['severity'].name == 'MEDIUM' and category >= 60):
        to_mask += [vuln['value']]

      if(vuln['severity'].name == 'LOW' and category >= 80):
        to_mask += [vuln['value']]

    #print(to_mask)
    return to_mask

  ### HMAC Genration and masked text genration
  import hmac
  import hashlib

  # Secret key
  secret_key = f"{username} + {unique_id}"
  secret_key = secret_key.encode('utf-8')
  def generate_hmac(text):
      return hmac.new(secret_key,
                      text.encode('utf-8'),
                      hashlib.sha256).hexdigest()


  def verify_hmac(text, hmac_to_verify):
      generated_hmac = generate_hmac(text)
      return hmac.compare_digest(generated_hmac, hmac_to_verify)

  def generate_masked_text(text):
    return ''.join('*' if char != ' ' else ' ' for char in text)



  # Function to get an array of masked texts
  # Input : Array of Unmasked text

  def get_masked_texts(unmasked_texts):
    masked_texts = []
    for text in unmasked_texts:
      masked_texts.append(generate_masked_text(text))
    return masked_texts


  # Function to get an array of hmac values based on input text
  # Input : Array of unmasked text

  def get_hmac_values(unmasked_texts):
    hmac_values = []
    for text in unmasked_texts:
      hmac_values.append(generate_hmac(text))
    return hmac_values


  # Function to get font size of vulnerable text

  import fitz  # PyMuPDF

  def find_font_size_in_pdf(pdf_path, target_word):
    # Open the PDF document
    pdf_document = fitz.open(pdf_path)

    # Iterate through each page of the PDF
    for page_number in range(len(pdf_document)):
        page = pdf_document[page_number]

        # Search for the target word
        text_instances = page.search_for(target_word)

        # If the word is found, retrieve its font size
        if text_instances:
            for inst in text_instances:
                # Get the text spans for the found word
                text_spans = page.get_text("dict")["blocks"]

                for span in text_spans:
                    if "lines" in span:  # Check if the block contains lines
                        for line in span["lines"]:
                            for span in line["spans"]:
                                if target_word in span["text"]:
                                    font_size = span["size"]
                                    print(f"Font size of '{target_word}' on page {page_number + 1}: {font_size}")
                                    return font_size
  import re
  def contains_char_or_number(s):
    # Check if the string contains at least one letter or one digit
    if re.search(r'[A-Za-z]', s) or re.search(r'\d', s):
        return True
    return False


  import pymupdf
  import fitz
  import re

  def mask_words_in_pdf(input_pdf_path, output_pdf_path, words_to_mask, masked_texts):
    # Open the input PDF
    pdf_document = fitz.open(input_pdf_path)
    print("below is shit")
    print(pdf_document)
    # Ensure the length of words_to_mask and masked_texts are the same
    if len(words_to_mask) != len(masked_texts):
        raise ValueError("The length of words_to_mask and masked_texts must be the same.")

    # Iterate through each page of the PDF
    for page in pdf_document:
        # Iterate through each word to mask
        for word, masked_text in zip(words_to_mask, masked_texts):

            # Check if the word contains characters or numbers
            if not contains_char_or_number(word):
                continue

            # Search for the specific word
            instances = page.search_for(word)
            for inst in instances:
                # Draw a white rectangle over the word to "erase" it
                page.draw_rect(inst, color=(1, 1, 1), fill=True)

                # Calculate the position to insert the masked text
                text_height = find_font_size_in_pdf(input_pdf_path, word)
                print(text_height)
                if(text_height == None):
                  break
                text_length = pymupdf.get_text_length(masked_text)  # Calculate the text width

                # Calculate the center position of the rectangle
                center_x = (inst[0] + inst[2]) / 2
                center_y = (inst[1] + inst[3]) / 2

                # Calculate the top-left corner of the text
                text_position = (center_x - text_length / 2, center_y + (text_height/3))  # Adjusted for vertical centering

                # Insert the masked text at the calculated position
                page.insert_text(text_position, masked_text, fontsize=text_height, color=(0, 0, 0))

                # Save the modified PDF to the output path
    pdf_document.save(output_pdf_path)


    ### Update PDF Meta data

    # Input : hmac_array is avalaible through get_hmac_values function, which returns an array

  from PyPDF2 import PdfReader, PdfWriter

  def update_pdf_metadata(input_pdf, output_pdf, hmac_array):

      reader = PdfReader(input_pdf)
      writer = PdfWriter()

      writer.append_pages_from_reader(reader)
      metadata = reader.metadata
      writer.add_metadata(metadata)

      new_metadata = {
        '/hmac': str(hmac_array)
      }

      # Write your custom metadata here:
      writer.add_metadata(new_metadata)

      with open(output_pdf, "wb") as fp:
          writer.write(fp)


      reader = PdfReader(output_pdf)
      print(reader.metadata)



  import os

  #Output is a single pdf masked with a certain category of vulnerabilities

  def final_mask(input_pdf_filepath, vulnerabilities, category):

    to_mask = mask_categories(vulnerabilities, category)
    masked_texts = get_masked_texts(to_mask)
    hmac_values = get_hmac_values(to_mask)

    #print(to_mask)
    #print(masked_texts)
    print(hmac_values)

    base_name, extension = os.path.splitext(input_pdf_filepath)

    output_pdf_masked = base_name + f'_masked_{category}' + extension
    mask_words_in_pdf(input_pdf_filepath, output_pdf_masked, to_mask, masked_texts)

    final_out = base_name + f'_output_{category}' + extension
    update_pdf_metadata(output_pdf_masked, final_out, hmac_values)

    print(final_out)   # ye path return karega
    return final_out
  return 
## Continue only if file type is pdf
  if(file_type != 'pdf'):
    return
  else:
    final_out = final_mask(input_pdf_path, vulnerabilities, severity_index)
from flask import Flask, request, jsonify
import pdfplumber
from PyPDF2 import PdfWriter, PdfReader
import re
import requests
import tempfile

def download_pdf_from_ipfs(ipfs_link):
    """
    Download the PDF file from an IPFS link.
    """
    response = requests.get(ipfs_link)
    if response.status_code == 200:
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        temp_pdf.write(response.content)
        temp_pdf.close()
        return temp_pdf.name
    else:
        raise Exception("Failed to download PDF from IPFS")
def main_func(input_pdf_path, vulnerabilities, severity_index, file_type, username, unique_id):

  ## Distributing Vulnerabilities into categories :

  ### Imported from Sachin's Code
  severity_index = severity_index * 20

  from enum import Enum

  class Severity(Enum):
      LOW = 1
      MEDIUM = 2
      HIGH = 3
      CRITICAL = 4

  def categorize_vulnerabilities(vulnerabilities):
      categorized = []

      for category, items in vulnerabilities.items():
          for item in items:
              if category == 'pii':
                  if '@' in item:
                      categorized.append({
                          'type': 'Personal Email Address',
                          'value': item,
                          'severity': Severity.MEDIUM,
                          'impact': 'Potential for targeted phishing attacks'
                      })
                  elif '-' in item and len(item) == 11:
                      categorized.append({
                          'type': 'Social Security Number',
                          'value': item,
                          'severity': Severity.CRITICAL,
                          'impact': 'High risk of identity theft'
                      })
                  else:
                      categorized.append({
                          'type': 'Other PII',
                          'value': item,
                          'severity': Severity.HIGH,
                          'impact': 'Potential for identity theft or privacy violation'
                      })

              elif category == 'financial':
                  if len(item) in [15, 16]:
                      categorized.append({
                          'type': 'Credit Card Number',
                          'value': item,
                          'severity': Severity.CRITICAL,
                          'impact': 'Financial fraud risk'
                      })
                  else:
                      categorized.append({
                          'type': 'Financial Account Number',
                          'value': item,
                          'severity': Severity.HIGH,
                          'impact': 'Risk of financial loss or fraud'
                      })

              elif category == 'confidential':
                  categorized.append({
                      'type': 'Confidential Business Information',
                      'value': item,
                      'severity': Severity.HIGH,
                      'impact': 'Potential loss of competitive advantage or legal issues'
                  })

              elif category == 'technical':
                  if '.' in item and len(item.split('.')) == 4:
                      categorized.append({
                          'type': 'IP Address',
                          'value': item,
                          'severity': Severity.MEDIUM,
                          'impact': 'Potential for network intrusion'
                      })
                  elif item.startswith('password'):
                      categorized.append({
                          'type': 'Password',
                          'value': item,
                          'severity': Severity.CRITICAL,
                          'impact': 'Direct system access risk'
                      })
                  else:
                      categorized.append({
                          'type': 'Technical Detail',
                          'value': item,
                          'severity': Severity.MEDIUM,
                          'impact': 'Potential for system exploitation'
                      })

              elif category == 'medical':
                  categorized.append({
                      'type': 'Medical Information',
                      'value': item,
                      'severity': Severity.HIGH,
                      'impact': 'HIPAA violation risk and privacy concerns'
                  })

              elif category == 'legal':
                  categorized.append({
                      'type': 'Legal Information',
                      'value': item,
                      'severity': Severity.MEDIUM,
                      'impact': 'Potential breach of confidentiality or legal ethics'
                  })

              elif category == 'authentication':
                  categorized.append({
                      'type': 'Authentication Credential',
                      'value': item,
                      'severity': Severity.CRITICAL,
                      'impact': 'Direct system access risk'
                  })

      return categorized


  # Function to exactly take out part of the pdf which we want to mask based on Severity Index too.
  """
      Input : Vulnerabilties in a list of dictionaries
              Severity Index (20,40,60,80)


      Ouput : Array of words to be masked
  """

  def mask_categories(vulnerabilities, category):

    to_mask = []

    categorized_vulnerabilities = categorize_vulnerabilities(vulnerabilities)
    for vuln in categorized_vulnerabilities:
      if(vuln['severity'].name == 'CRITICAL'):
        to_mask += [vuln['value']]

      if((vuln['severity'].name == 'HIGH') and (category >= 40)):
        to_mask += [vuln['value']]


      if(vuln['severity'].name == 'MEDIUM' and category >= 60):
        to_mask += [vuln['value']]

      if(vuln['severity'].name == 'LOW' and category >= 80):
        to_mask += [vuln['value']]

    #print(to_mask)
    return to_mask

  ### HMAC Genration and masked text genration
  import hmac
  import hashlib

  # Secret key
  secret_key = f"{username} + {unique_id}"
  secret_key = secret_key.encode('utf-8')
  def generate_hmac(text):
      return hmac.new(secret_key,
                      text.encode('utf-8'),
                      hashlib.sha256).hexdigest()


  def verify_hmac(text, hmac_to_verify):
      generated_hmac = generate_hmac(text)
      return hmac.compare_digest(generated_hmac, hmac_to_verify)

  def generate_masked_text(text):
    return ''.join('*' if char != ' ' else ' ' for char in text)



  # Function to get an array of masked texts
  # Input : Array of Unmasked text

  def get_masked_texts(unmasked_texts):
    masked_texts = []
    for text in unmasked_texts:
      masked_texts.append(generate_masked_text(text))
    return masked_texts


  # Function to get an array of hmac values based on input text
  # Input : Array of unmasked text

  def get_hmac_values(unmasked_texts):

    def array_to_string(text_array):
    # Join the array elements into a single string, separated by a space
      result_string = ' '.join(text_array)
      return result_string

    result_string = array_to_string(unmasked_texts)
    return generate_hmac(result_string)


  # Function to get font size of vulnerable text

  import fitz  # PyMuPDF

  def find_font_size_in_pdf(pdf_path, target_word):
    # Open the PDF document
    pdf_document = fitz.open(pdf_path)

    # Iterate through each page of the PDF
    for page_number in range(len(pdf_document)):
        page = pdf_document[page_number]

        # Search for the target word
        text_instances = page.search_for(target_word)

        # If the word is found, retrieve its font size
        if text_instances:
            for inst in text_instances:
                # Get the text spans for the found word
                text_spans = page.get_text("dict")["blocks"]

                for span in text_spans:
                    if "lines" in span:  # Check if the block contains lines
                        for line in span["lines"]:
                            for span in line["spans"]:
                                if target_word in span["text"]:
                                    font_size = span["size"]
                                    print(f"Font size of '{target_word}' on page {page_number + 1}: {font_size}")
                                    return font_size
  import re
  def contains_char_or_number(s):
    # Check if the string contains at least one letter or one digit
    if re.search(r'[A-Za-z]', s) or re.search(r'\d', s):
        return True
    return False


  import pymupdf
  import fitz
  import re

  def mask_words_in_pdf(input_pdf_path, output_pdf_path, words_to_mask, masked_texts):
    # Open the input PDF
    pdf_document = fitz.open(input_pdf_path)
    print("below is shit")
    print(pdf_document)
    # Ensure the length of words_to_mask and masked_texts are the same
    if len(words_to_mask) != len(masked_texts):
        raise ValueError("The length of words_to_mask and masked_texts must be the same.")

    # Iterate through each page of the PDF
    for page in pdf_document:
        # Iterate through each word to mask
        for word, masked_text in zip(words_to_mask, masked_texts):

            # Check if the word contains characters or numbers
            if not contains_char_or_number(word):
                continue

            # Search for the specific word
            instances = page.search_for(word)
            for inst in instances:
                # Draw a white rectangle over the word to "erase" it
                page.draw_rect(inst, color=(1, 1, 1), fill=True)

                # Calculate the position to insert the masked text
                text_height = find_font_size_in_pdf(input_pdf_path, word)
                print(text_height)
                if(text_height == None):
                  break
                text_length = pymupdf.get_text_length(masked_text)  # Calculate the text width

                # Calculate the center position of the rectangle
                center_x = (inst[0] + inst[2]) / 2
                center_y = (inst[1] + inst[3]) / 2

                # Calculate the top-left corner of the text
                text_position = (center_x - text_length / 2, center_y + (text_height/3))  # Adjusted for vertical centering

                # Insert the masked text at the calculated position
                page.insert_text(text_position, masked_text, fontsize=text_height, color=(0, 0, 0))

                # Save the modified PDF to the output path
    pdf_document.save(output_pdf_path)


    ### Update PDF Meta data

    # Input : hmac_array is avalaible through get_hmac_values function, which returns an array

  from PyPDF2 import PdfReader, PdfWriter

  def update_pdf_metadata(input_pdf, output_pdf, hmac_array):

      reader = PdfReader(input_pdf)
      writer = PdfWriter()

      writer.append_pages_from_reader(reader)
      metadata = reader.metadata
      writer.add_metadata(metadata)

      new_metadata = {
        '/hmac': str(hmac_array)
      }

      # Write your custom metadata here:
      writer.add_metadata(new_metadata)

      with open(output_pdf, "wb") as fp:
          writer.write(fp)


      reader = PdfReader(output_pdf)
      print(reader.metadata)



  """
         ---------- Certificate Genration ---------
  """
  from PIL import Image, ImageDraw, ImageFont
  import qrcode
  import os

  def generate_certificate(username, input_file_link, hmac_data):
    # Create a new blank image with a light blue background
    width, height = 1000, 700
    cert = Image.new('RGB', (width, height), '#E6F7FF')
    draw = ImageDraw.Draw(cert)

    # Use the default font provided by PIL, with increased font size
    font_title = ImageFont.load_default()
    font_content = ImageFont.load_default()

    # Draw a border around the certificate
    border_color = '#00509E'
    border_width = 10
    draw.rectangle([border_width, border_width, width-border_width, height-border_width], outline=border_color, width=border_width)

    # Title Section (double the size)
    title_text = "Certificate of REDACT"
    draw.text((100, 50), title_text, fill=border_color, font=font_title)

    # Add an underline below the title
    draw.line((90, 80, 400, 80), fill=border_color, width=3)

    # Presented to Section (double the size)
    draw.text((100, 150), f"Presented to:", fill="black", font=font_content)
    draw.text((100, 200), f"{username}", fill="black", font=font_title)

    # File Link Section (double the size)
    draw.text((100, 300), f"File Link: {input_file_link}", fill="black", font=font_content)

    # Generate and add the QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(hmac_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill='black', back_color='white')

    # Resize and paste QR code onto the certificate
    qr_img = qr_img.resize((120, 120))
    cert.paste(qr_img, (width - 200, height - 200))

    # Add the signature above the line
    draw.text((100, height - 180), "PRAGYANTRIX", fill="black", font=font_content)
    draw.line((100, height - 150, 400, height - 150), fill=border_color, width=3)

    # Customize the output file name based on the input file name
    base_name, _ = os.path.splitext(input_file_link)
    output_file = base_name + "_certificate.png"

    # Save the certificate as an image file
    cert.save(output_file)

    print(f"Certificate generated and saved as {output_file}")

    return output_file

  import os

  #Output is a single pdf masked with a certain category of vulnerabilities

  def final_mask(input_pdf_filepath, vulnerabilities, category):

    to_mask = mask_categories(vulnerabilities, category)
    masked_texts = get_masked_texts(to_mask)
    hmac_values = get_hmac_values(to_mask)

    #print(to_mask)
    #print(masked_texts)
    print(hmac_values)

    base_name, extension = os.path.splitext(input_pdf_filepath)

    output_pdf_masked = base_name + f'_masked_{category}' + extension
    mask_words_in_pdf(input_pdf_filepath, output_pdf_masked, to_mask, masked_texts)

    final_out = base_name + f'_output_{category}' + extension
    update_pdf_metadata(output_pdf_masked, final_out, hmac_values)

    print(final_out)   # ye path return karega

    certi_link  = generate_certificate(username, final_out, hmac_values)

    return final_out, certi_link


## Continue only if file type is pdf
  if(file_type != 'pdf'):
    return
  else:
    final_link = final_mask(input_pdf_path, vulnerabilities, severity_index)
    print(final_link)
    return final_link
@app.route('/api/testmask', methods=['POST'])
def test_mask():
    try:
        # Parse the input data from the request
        data = request.json
        ipfs_link = data.get('input_pdf_path')
        vulnerabilities = data.get('vulnerabilities')
        severity_index = data.get('severity_index')
        file_type = data.get('file_type')
        username = data.get('username')
        unique_id = data.get('unique_id')

        if file_type.lower() != 'pdf':
            return jsonify({"error": "Unsupported file type"}), 400

        # Download the PDF from IPFS
        input_pdf_path = download_pdf_from_ipfs(ipfs_link)

        # Process the PDF and mask the sensitive information
        masked_pdf_path, certificate_path = main_func(input_pdf_path,vulnerabilities,severity_index,file_type,username,unique_id)


        # Upload the masked PDF to IPFS 
        masked_ipfs_link = masked_pdf_path

        # Upload the certificate PDF to IPFS
        certificate_ipfs_result = certificate_path
        certificate_ipfs_link = certificate_ipfs_result

        # Return the IPFS links for the masked PDF and certificate
        return jsonify({
            "masked_pdf_ipfs_link": masked_ipfs_link,
            "certificate_ipfs_link": certificate_ipfs_link
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
from flask import Flask, request, jsonify
import cv2
import hmac
from pypdf import PdfReader


def verify_hmac(pdf_path, certificate_path):
    try:
        reader = PdfReader(pdf_path)
        meta = reader.metadata

        # Check if /hmac exists in metadata
        if '/hmac' not in meta:
            return False

        pdf_hmac = meta['/hmac']
        img = cv2.imread(certificate_path)

        # Initialize the QRCode detector
        detector = cv2.QRCodeDetector()

        # Detect and decode the QR code
        decoded_info, points, straight_qrcode = detector.detectAndDecode(img)

        certi_hmac = decoded_info
        if certi_hmac is None:
            return False

        # Compare the HMACs
        return hmac.compare_digest(pdf_hmac, certi_hmac)
    except Exception as e:
        print(f"Error in verify_hmac: {e}")
        return False

@app.route('/api/validategetlink', methods=['POST'])
def validate_get_link():
    try:
        data = request.json
        pdf_path = data.get('pdf_path')
        certificate_path = data.get('certificate_path')

        if not pdf_path or not certificate_path:
            return jsonify({'error': 'Missing pdf_path or certificate_path'}), 400

        is_valid = verify_hmac(pdf_path, certificate_path)
        return jsonify({'is_valid': is_valid})
    except Exception as e:
        print(f"Error in validate_get_link: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500
if __name__ == '__main__':
    app.run(debug=True)