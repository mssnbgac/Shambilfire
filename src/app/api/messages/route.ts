import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for messages (in production, use a database)
let messages: any[] = [];

// Initialize with demo messages
const initializeMessages = () => {
  if (messages.length === 0) {
    messages = [
      {
        id: 'msg-001',
        senderId: 'parent-1',
        senderName: 'Sarah Wilson',
        senderRole: 'parent',
        recipientId: 'admin-1',
        recipientName: 'John Administrator',
        recipientRole: 'admin',
        subject: 'Question about School Fees',
        message: 'Hello, I have a question about the payment schedule for this term. Could you please provide more details?',
        timestamp: new Date().toISOString(),
        read: false,
        replied: false,
        replyTo: null
      },
      {
        id: 'msg-002',
        senderId: 'admin-1',
        senderName: 'John Administrator',
        senderRole: 'admin',
        recipientId: 'parent-1',
        recipientName: 'Sarah Wilson',
        recipientRole: 'parent',
        subject: 'Re: Question about School Fees',
        message: 'Thank you for your inquiry. The payment schedule has been sent to your email. Please let me know if you need any clarification.',
        timestamp: new Date().toISOString(),
        read: false,
        replied: false,
        replyTo: 'msg-001'
      }
    ];
  }
};

// GET - Retrieve messages
export async function GET(request: NextRequest) {
  try {
    initializeMessages();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const conversationWith = searchParams.get('conversationWith');
    
    let filteredMessages = messages;
    
    if (userId) {
      // Get messages where user is sender or recipient
      filteredMessages = messages.filter(m => 
        m.senderId === userId || m.recipientId === userId
      );
    }
    
    if (conversationWith) {
      // Get conversation between two users
      filteredMessages = filteredMessages.filter(m => 
        (m.senderId === userId && m.recipientId === conversationWith) ||
        (m.senderId === conversationWith && m.recipientId === userId)
      );
    }
    
    // Sort by timestamp (newest first)
    filteredMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return NextResponse.json({ messages: filteredMessages });
  } catch (error) {
    console.error('GET /api/messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send new message
export async function POST(request: NextRequest) {
  try {
    initializeMessages();
    
    const messageData = await request.json();
    
    const newMessage = {
      ...messageData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      read: false,
      replied: false
    };
    
    messages.push(newMessage);
    
    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('POST /api/messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update message (mark as read, etc.)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');
    const updateData = await request.json();
    
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }
    
    const messageIndex = messages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    messages[messageIndex] = {
      ...messages[messageIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ message: messages[messageIndex] });
  } catch (error) {
    console.error('PUT /api/messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}