// src/app/api/getMetrics/route.js
import { getUserMetricsByUsername } from '@/database/db';


export async function GET(request) {
    try {
        const url = new URL(request.url);
        let username = url.searchParams.get('username');

        if (!username) {
            return new Response(JSON.stringify({ error: 'Username query parameter is required' }), { status: 400 });
        }

        console.log('Fetching metrics for username:', username);  // Debugging log
        // Clean username by removing extra quotes or unwanted characters
        username = username.replace(/^"(.*)"$/, '$1').trim();

        console.log('Fetching metrics for username:', username);  // Debugging log

        const metrics = await getUserMetricsByUsername(username);

        if (metrics) {
            return new Response(JSON.stringify(metrics), { status: 200 });
        } else {
            console.log('No metrics found for:', username);  // Debugging log
            return new Response(JSON.stringify({ error: 'No metrics found' }), { status: 404 });
        }
    } catch (error) {
        console.error('Error fetching user metrics:', error);
        return new Response(JSON.stringify({ error: 'Database query failed' }), { status: 500 });
    }
}