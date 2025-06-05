import { updateUser } from '@/database/db';

export async function POST(request) {
    try {
        const data = await request.json();

        let { username, incrementMask = 0, incrementDemask = 0, incrementValidation = 0 } = data;
        if (!username) {
            return new Response(JSON.stringify({ error: 'Username is required' }), { status: 400 });
        }
        username=username.replace(/^"(.*)"$/, '$1').trim();
        console.log("nffhhuhf", username, incrementMask , incrementDemask , incrementValidation )
        const updatedMetrics = {
            incrementMask,
            incrementDemask,
            incrementValidation
        };

        const updatedUser = await updateUser(username, updatedMetrics);

        if (updatedUser) {
            return new Response(JSON.stringify(updatedUser), { status: 200 });
        } else {
            return new Response(JSON.stringify({ error: 'User update failed' }), { status: 500 });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        return new Response(JSON.stringify({ error: 'Database query failed' }), { status: 500 });
    }
}