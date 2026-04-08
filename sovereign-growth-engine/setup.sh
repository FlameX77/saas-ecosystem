#!/bin/bash
set -e

echo "Running setup part 1..."
bash setup_part1.sh

echo "Running setup part 2..."
bash setup_part2.sh

echo "Running setup part 3 & 4..."
bash setup_part3_4.sh

echo "Running setup part 5 & 6..."
bash setup_part5_6.sh

echo "Running setup part 7..."
bash setup_part7.sh

echo "Running setup part 8_1..."
bash setup_part8_1.sh

echo "Running setup part 8_2..."
bash setup_part8_2.sh

echo "Running setup part 8_3..."
bash setup_part8_3.sh

echo "Setup completed successfully!"
