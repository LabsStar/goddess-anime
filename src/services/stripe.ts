import user from "../models/user";
import { Client, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import logger from "../utils/logger";
import { Document } from "mongoose";
import cron from "node-cron";
import * as stripe from "stripe";
import CustomClient from '../interfaces/CustomClient';

const stripe_config = {
    KEYS: {
        SECRET: "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",
        PUBLISHABLE: "pk_live_51NLoLxI8Ok4fZCOTDv7Ie6XRVP9mUZnKJvdwYHZTkpbloDfmf64NsomM8BiwxUhvG9j6krkxFETXyUkzmquEMqEN00qsHJx2iA",
    },
    ITEMS: {
        PREMIUM_OTAKU: "price_1NQYfhI8Ok4fZCOTbYHzLxcq",
        PREMIUM_SENPAI: "price_1NQYfhI8Ok4fZCOTbYHzLxcq",
    } as { [key: string]: string },
};

class Stripe {
    constructor() {
    }

    async init() {
        const stripe_client = new stripe.default(stripe_config.KEYS.SECRET, {
            apiVersion: "2022-11-15",
        });

        cron.schedule("0 0 * * *", async () => {
            const users = await user.find({});

            for (const user of users) {
                if (user.premium) {
                    try {
                        const customer = await stripe_client.customers.retrieve(user.stripe_customer_id as string) as stripe.Stripe.Customer;
                        const subscriptions = customer.subscriptions?.data;

                        if (subscriptions && subscriptions.length > 0) {
                            const subscription = subscriptions[0];

                            if (subscription.status === "active") {
                                const subscription_end = new Date(subscription.current_period_end * 1000);
                                const now = new Date();

                                if (subscription_end < now) {
                                    await this.cancelSubscription(user);
                                }
                            }
                        }
                    } catch (error) {
                        console.error("Error retrieving customer:", error);
                    }
                }
            }
        });
    }

    async cancelSubscription(user: any) {
        const stripe_client = new stripe.default(stripe_config.KEYS.SECRET, {
            apiVersion: "2022-11-15",
        });

        try {
            const customer = await stripe_client.customers.retrieve(user.stripe_customer_id as string) as stripe.Stripe.Customer;
            const subscriptions = customer.subscriptions?.data;

            if (subscriptions && subscriptions.length > 0) {
                const subscription = subscriptions[0];

                if (subscription.status === "active") {
                    await stripe_client.subscriptions.del(subscription.id);
                    await user.updateOne({ premium: false });
                    await user.save();

                    const embed = new MessageEmbed()
                        .setTitle("Premium Subscription Canceled")
                        .setURL("https://goddessanime.com/premium")
                        .setImage("https://media.tenor.com/s-R26oI4jlgAAAAd/anime-girl.gif")
                        .setDescription("Your premium subscription has been canceled. You can resubscribe at any time.")
                        .setColor("RED");

                    //@ts-ignore
                    await CustomClient.instance.users.cache.get(user.discordId).send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error("Error retrieving customer:", error);
        }
    }

    async createCheckoutSession(type: string) {
        const stripe_client = new stripe.default(stripe_config.KEYS.SECRET, {
            apiVersion: "2022-11-15",
        });

        const session = await stripe_client.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: this.getItem(type.toUpperCase()),
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: "https://goddessanime.com/premium/success",
            cancel_url: "https://goddessanime.com/premium/cancel",
        });

        return session;
    }

    async createCustomer(user: any) {
        const stripe_client = new stripe.default(stripe_config.KEYS.SECRET, {
            apiVersion: "2022-11-15",
        });

        const customer = await stripe_client.customers.create({
            email: user.email,
            name: user.username,
            metadata: {
                discord_id: user.discordId,
            },
        });

        return customer;
    }

    private getItem(item: string) {
        const FULL_ITEM = stripe_config.ITEMS[item];

        if (!FULL_ITEM) return "No item found";

        return FULL_ITEM;
    }

    async createSubscription(user: any, session: any, item: any) {
        const stripe_client = new stripe.default(stripe_config.KEYS.SECRET, {
            apiVersion: "2022-11-15",
        });

        const subscription = await stripe_client.subscriptions.create({
            customer: user.stripe_customer_id,
            items: [
                {
                    price: this.getItem(item),
                },
            ],
            default_payment_method: session.payment_method,
        });

        return subscription;
    }

    async getCustomer(user: any) {
        const stripe_client = new stripe.default(stripe_config.KEYS.SECRET, {
            apiVersion: "2022-11-15",
        });

        const customer = await stripe_client.customers.retrieve(user.stripe_customer_id);

        return customer;
    }
}

export default Stripe;
