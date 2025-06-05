import { createUser } from '@/database/db';

export async function POST(request) {
    try {
        const { username, email } = await request.json();

        if (!username || !email) {
            return new Response(JSON.stringify({ error: 'Username and email are required' }), { status: 400 });
        }

        const user = await createUser(username, email);

        if (user) {
            return new Response(JSON.stringify(user), { status: 200 });
        } else {
            return new Response(JSON.stringify({ error: 'User creation failed' }), { status: 500 });
        }
    } catch (error) {
        console.error('Error creating user:', error);
        return new Response(JSON.stringify({ error: 'Database query failed' }), { status: 500 });
    }
}