#!/bin/bash

# CDMS GitHub Push Helper Script
# This script helps you push both CDMS repositories to GitHub

echo "================================================"
echo "   CDMS GitHub Push Helper"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}IMPORTANT: Before running this script:${NC}"
echo "1. Create GitHub repository: cdms-admin"
echo "   Visit: https://github.com/new"
echo "   Name: cdms-admin"
echo "   Do NOT initialize with README"
echo ""
echo "2. Get your Personal Access Token"
echo "   Visit: https://github.com/settings/tokens/new"
echo "   Select scope: repo"
echo "   Copy the token (starts with ghp_)"
echo ""
read -p "Press Enter when ready to continue..."

echo ""
echo "================================================"
echo "   Pushing Main CDMS Repository"
echo "================================================"
echo ""
echo "Repository: https://github.com/adithyangireeshkumar/cdms"
echo ""

cd /home/adhi/Documents/CDMS

echo "Current status:"
git status

echo ""
echo -e "${YELLOW}Attempting to push...${NC}"
echo "When prompted:"
echo "  Username: adithyangireeshkumar"
echo "  Password: <paste your Personal Access Token>"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Main CDMS pushed successfully!${NC}"
else
    echo -e "${RED}✗ Failed to push main CDMS${NC}"
    echo "Please check your credentials and try again manually:"
    echo "  cd /home/adhi/Documents/CDMS"
    echo "  git push -u origin main"
    exit 1
fi

echo ""
echo "================================================"
echo "   Pushing Admin Dashboard Repository"
echo "================================================"
echo ""
echo "Repository: https://github.com/adithyangireeshkumar/cdms-admin"
echo ""

cd /home/adhi/Documents/CDMS/CDMS-Admin

echo "Current status:"
git status

echo ""
echo -e "${YELLOW}Attempting to push...${NC}"
echo "When prompted:"
echo "  Username: adithyangireeshkumar"
echo "  Password: <paste your Personal Access Token>"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Admin Dashboard pushed successfully!${NC}"
else
    echo -e "${RED}✗ Failed to push admin dashboard${NC}"
    echo "Please check your credentials and try again manually:"
    echo "  cd /home/adhi/Documents/CDMS/CDMS-Admin"
    echo "  git push -u origin main"
    exit 1
fi

echo ""
echo "================================================"
echo -e "${GREEN}   SUCCESS! Both repositories pushed!${NC}"
echo "================================================"
echo ""
echo "Your repositories are now available at:"
echo "  Main CDMS: https://github.com/adithyangireeshkumar/cdms"
echo "  Admin Dashboard: https://github.com/adithyangireeshkumar/cdms-admin"
echo ""
