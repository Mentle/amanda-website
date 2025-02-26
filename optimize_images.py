#!/usr/bin/env python3
import os
from PIL import Image
import concurrent.futures
from pathlib import Path

def optimize_image(file_path, max_width=1920, quality=85):
    """Optimize a single image file."""
    try:
        # Open the image
        with Image.open(file_path) as img:
            # Convert RGBA to RGB if necessary
            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1])
                img = background

            # Calculate new dimensions while maintaining aspect ratio
            width_percent = max_width / float(img.size[0])
            if width_percent < 1:  # Only resize if image is larger than max_width
                new_height = int(float(img.size[1]) * width_percent)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

            # Create output path
            output_path = str(file_path).rsplit('.', 1)[0] + '.webp'
            
            # Save as WebP
            img.save(output_path, 'WEBP', quality=quality, optimize=True)
            
            # Get file sizes for comparison
            original_size = os.path.getsize(file_path)
            new_size = os.path.getsize(output_path)
            
            return {
                'file': file_path,
                'original_size': original_size,
                'new_size': new_size,
                'reduction': (original_size - new_size) / original_size * 100
            }
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return None

def process_directory(directory, extensions=('.jpg', '.jpeg', '.png')):
    """Process all images in a directory and its subdirectories."""
    # Get all image files
    image_files = []
    for ext in extensions:
        image_files.extend(Path(directory).rglob(f'*{ext}'))
        image_files.extend(Path(directory).rglob(f'*{ext.upper()}'))

    print(f"Found {len(image_files)} images to process")
    
    # Process images in parallel
    results = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_file = {executor.submit(optimize_image, str(f)): f for f in image_files}
        for future in concurrent.futures.as_completed(future_to_file):
            result = future.result()
            if result:
                results.append(result)
                print(f"Processed {result['file']}")
                print(f"Size reduction: {result['reduction']:.1f}%")
                print(f"Original: {result['original_size'] / 1024 / 1024:.1f}MB")
                print(f"New: {result['new_size'] / 1024 / 1024:.1f}MB")
                print("-" * 50)

    # Print summary
    if results:
        total_original = sum(r['original_size'] for r in results)
        total_new = sum(r['new_size'] for r in results)
        total_reduction = (total_original - total_new) / total_original * 100
        
        print("\nSummary:")
        print(f"Total images processed: {len(results)}")
        print(f"Total original size: {total_original / 1024 / 1024:.1f}MB")
        print(f"Total new size: {total_new / 1024 / 1024:.1f}MB")
        print(f"Total reduction: {total_reduction:.1f}%")

if __name__ == '__main__':
    projects_dir = 'projects'
    process_directory(projects_dir)
