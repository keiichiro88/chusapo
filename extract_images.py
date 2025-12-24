import sys
import os

def extract_jpeg_images(pdf_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    with open(pdf_path, 'rb') as f:
        pdf_data = f.read()

    # JPEG Start: FF D8, End: FF D9
    # This is a naive extraction method for PDF streams
    start_marker = b'\xff\xd8'
    end_marker = b'\xff\xd9'
    
    start_pos = 0
    count = 0
    
    while True:
        start_index = pdf_data.find(start_marker, start_pos)
        if start_index == -1:
            break
            
        end_index = pdf_data.find(end_marker, start_index)
        if end_index == -1:
            break
            
        # Extract image data
        image_data = pdf_data[start_index:end_index+2]
        
        # Filter small images (thumbnails, etc.) - less than 10KB
        if len(image_data) > 10000:
            count += 1
            output_path = os.path.join(output_dir, f'image_{count:03d}.jpg')
            with open(output_path, 'wb') as img_file:
                img_file.write(image_data)
            print(f'Extracted: {output_path} ({len(image_data)} bytes)')
            
        start_pos = end_index + 2

    print(f'Total extracted images: {count}')

if __name__ == '__main__':
    pdf_path = '/Users/MedConsult/ハヤピンpresents採血・静脈ルート確保.pdf'
    output_dir = '/Users/MedConsult/extracted_images'
    print(f"Extracting images from {pdf_path}...")
    try:
        extract_jpeg_images(pdf_path, output_dir)
    except Exception as e:
        print(f"Error: {e}")
