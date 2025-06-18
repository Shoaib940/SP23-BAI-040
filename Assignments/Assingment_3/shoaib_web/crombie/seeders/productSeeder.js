const mongoose = require('mongoose');
const Product = require('../models/Product');

// MongoDB connection string
const mongoURI = 'mongodb+srv://sp23bai040:j7cb9VnP8qIazTR6@cluster0.tlbzrx4.mongodb.net/';

const products = [
    {
        name: "Classic Crombie Coat",
        description: "The iconic Crombie coat in pure wool, featuring our signature clean lines and impeccable tailoring. A timeless investment piece that defines British luxury.",
        price: 1295.00,
        imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80",
        category: "Coats",
        stock: 15,
        features: [
            "100% Pure Wool",
            "Three-button closure",
            "Notched lapels",
            "Two side pockets",
            "One breast pocket",
            "Full silk lining"
        ]
    },
    {
        name: "Herringbone Overcoat",
        description: "A sophisticated herringbone pattern overcoat crafted from the finest British wool. Perfect for both formal and casual occasions.",
        price: 1495.00,
        imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80",
        category: "Coats",
        stock: 10,
        features: [
            "British wool",
            "Herringbone pattern",
            "Double-breasted",
            "Peak lapels",
            "Four-button cuffs",
            "Interior pockets"
        ]
    },
    {
        name: "Cashmere Blend Topcoat",
        description: "Luxurious cashmere blend topcoat offering exceptional warmth and comfort. A perfect blend of traditional craftsmanship and modern styling.",
        price: 1895.00,
        imageUrl: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=800&q=80",
        category: "Coats",
        stock: 8,
        features: [
            "Cashmere and wool blend",
            "Single-breasted",
            "Notch lapels",
            "Horn buttons",
            "Hand-finished details",
            "Signature Crombie lining"
        ]
    },
    {
        name: "Retro Covert Coat",
        description: "A classic covert coat inspired by our heritage designs. Made from durable covert cloth with traditional details.",
        price: 1195.00,
        imageUrl: "https://images.unsplash.com/photo-1611485988300-b7ef6c1766e4?auto=format&fit=crop&w=800&q=80",
        category: "Coats",
        stock: 12,
        features: [
            "Covert cloth",
            "Velvet collar",
            "Four-button front",
            "Ticket pocket",
            "Traditional styling",
            "Weather-resistant finish"
        ]
    },
    {
        name: "Wool Blazer",
        description: "A refined wool blazer perfect for any formal occasion. Features our signature cut and premium materials.",
        price: 895.00,
        imageUrl: "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=800&q=80",
        category: "Blazers",
        stock: 20,
        features: [
            "100% wool",
            "Two-button closure",
            "Four-button cuffs",
            "Dual vents",
            "Fully canvassed",
            "Working buttonholes"
        ]
    },
    {
        name: "Pinstripe Suit",
        description: "Classic pinstripe suit crafted from Super 130s wool. The epitome of British tailoring excellence.",
        price: 1695.00,
        imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
        category: "Suits",
        stock: 10,
        features: [
            "Super 130s wool",
            "Classic fit",
            "Pinstripe pattern",
            "Fully canvassed",
            "Matching trousers",
            "Hand-finished details"
        ]
    }
];

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(async () => {
        console.log('Connected to MongoDB...');
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products...');

        // Insert new products
        await Product.insertMany(products);
        console.log('Products seeded successfully!');

        // Close the connection
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error seeding products:', err);
        process.exit(1);
    }); 