# Stanlore 💜

> The operating system for fandoms. Starting with ARMY.

Stanlore is a fan-first photocard collection tracker built for BTS collectors. It gives fans a digital binder to organize what they own, track what they still want, manage duplicates for trading, and share their collection with others.

Instead of relying on spreadsheets, notes apps, screenshots, and social media posts, Stanlore is designed to bring the entire collecting experience into one clean platform organized the way fans actually collect: by member, album, and era.

## What it does

Stanlore helps collectors manage and showcase their BTS photocard collections in one place.

It is being built to support:

- digital collection tracking
- wishlist management
- duplicate tracking for trades
- public collector profiles
- era-based collection progress
- fandom-centered design and workflows

## Current focus

Stanlore is currently focused on **BTS and ARMY collectors** first.

The long-term vision is to expand into a broader fandom collection platform that can support other groups, communities, and collectible ecosystems.

## Features

- **Digital binder**  
  Browse a collector-style interface for organizing cards by member, album, and era.

- **Collection tracking**  
  Mark cards as owned, wishlist, or duplicate.

- **Era progress**  
  View collection completion across different eras.

- **Public profiles**  
  Share a collector identity and collection page with others.

- **Trade-ready foundation**  
  Built with future have/want trading workflows in mind.

## Roadmap

- [x] Landing page with intro animation
- [x] Authentication flow
- [x] Supabase integration
- [x] Collection binder UI
- [x] Public profile page
- [ ] Real photocard catalog with images and metadata
- [ ] Card status toggles connected to Supabase
- [ ] Trade listings board
- [ ] Comeback tracker
- [ ] Photocard scanner for card recognition
- [ ] Multi-fandom support

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend / Database

- Supabase
- PostgreSQL
- Row Level Security (RLS)

## Why I built this

Stanlore was built from the perspective of a fan who wanted something better than spreadsheets and scattered screenshots.

The goal is to create a product that feels both useful and meaningful to collectors, something aesthetic, structured, and actually designed around fandom behavior instead of forcing fans into generic tools.

## Local Setup

Clone the repository and install dependencies:

    npm install
    npm run dev

Then open the local development URL shown by Vite.

## Status

Stanlore is currently in active development.

This version focuses on the core product foundation, including the landing page, authentication flow, collection-oriented UI, public profile structure, and Supabase integration. The next major milestone is connecting a real photocard catalog and full collection state to the database.

## Vision

Stanlore starts with BTS.

The bigger vision is to build the platform collectors wish already existed.

## Project Structure

    frontend/
      src/
        context/
          AuthContext.jsx
        hooks/
          usecollection.js
        lib/
          supabase.js
        pages/
          Auth/
            AuthPage.jsx
          Home/
            HomePage.jsx
          Landing/
            LandingPage.jsx
          Profile/
            ProfilePage.jsx
        styles/
          auth.css
          Components.css
          globals.css
          Home.css
          Landing.css
          profile.css
        App.jsx
        main.jsx

    Backend/
      Supabase/
        migration.sql
