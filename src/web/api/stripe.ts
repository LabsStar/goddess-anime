import user from '../../models/user';
import { Request, Response, Router } from 'express';
import { Document, DocumentDefinition } from 'mongoose';
import axios from 'axios';
import config from '../../config';
import fs from "fs";
import developer_applications from '../../models/developer_applications';
import { ApplicationStatus, Permissions } from "../../utils/developerapps";
import path from "path";
import CustomClient from '../../interfaces/CustomClient';
import { Client, MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as CustomStripe from '../../services/stripe';
const stripe = require('stripe')("pk_test_51NLoLxI8Ok4fZCOTcjGPNETGNA5u4nBZzo75HIORne1wrwa01zFzYnY32Xqdu5TEaX0PMntXEirZtPfndFiIZoFc00RdrENZIT");


const striperouter = Router();
const customstripe = new CustomStripe.default();

striperouter.use(cookieParser());

striperouter.use((req: Request, res: Response, next: Function) => {
    res.setHeader("X-Powered-By", "Hyperstar");
    next();
});

striperouter.get('/', (req: Request, res: Response) => {
    res.redirect('https://goddessanime.com');
});



striperouter.get('/create-checkout-session/:type', async (req: Request, res: Response) => {   
    const ss = await customstripe.createCheckoutSession(req.params.type as string);

    return res.redirect(303, ss.url as string);
});

striperouter.post('/webhook', async (req: Request, res: Response) => {
    let event;

    const webhookSecret = 'whsec_1ea57c0b2de3ebefe07a5dc020e2a06c774bee038b8a8334ad3652e59fc81819';

    let signature = req.headers['stripe-signature'] as string;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
        console.log(event);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }
    
    if (event.type === 'checkout.session.completed') {
        console.log('Payment was successful.');
    }

    res.status(200).json({ received: true });
});
  

export default striperouter;
