import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

describe('ChatGateway', () => {
  const chatService = {
    getMessages: jest.fn(),
    addMessage: jest.fn(),
  } as unknown as ChatService;

  const jwtService = {
    verifyAsync: jest.fn(),
  } as unknown as JwtService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function buildSocket() {
    const roomEmitter = {
      emit: jest.fn(),
    };

    return {
      client: {
        data: { user: { sub: 'alice' } },
        join: jest.fn(),
        leave: jest.fn(),
        emit: jest.fn(),
        to: jest.fn().mockReturnValue(roomEmitter),
      } as unknown as Socket,
      roomEmitter,
    };
  }

  it('maps join payload to groupId and emits normalized history', async () => {
    const gateway = new ChatGateway(chatService, jwtService);
    const { client } = buildSocket();
    const date = new Date('2026-03-23T10:00:00.000Z');

    (chatService.getMessages as jest.Mock).mockResolvedValue([
      {
        id: 7,
        userId: 'alice',
        chatId: 'group-1',
        message: 'hola',
        date,
      },
    ]);

    await gateway.handleJoinChat(client, { groupId: 'group-1' });

    expect(chatService.getMessages).toHaveBeenCalledWith('group-1', 'alice');
    expect((client.join as jest.Mock)).toHaveBeenCalledWith('group-1');
    expect((client.emit as jest.Mock)).toHaveBeenNthCalledWith(1, 'messages', {
      groupId: 'group-1',
      messages: [
        {
          id: 7,
          userId: 'alice',
          groupId: 'group-1',
          message: 'hola',
          date,
        },
      ],
    });
    expect((client.emit as jest.Mock)).toHaveBeenNthCalledWith(2, 'joined_chat', {
      groupId: 'group-1',
      status: 'success',
    });
  });

  it('sends and broadcasts normalized new message payload', async () => {
    const gateway = new ChatGateway(chatService, jwtService);
    const { client, roomEmitter } = buildSocket();
    const date = new Date('2026-03-23T10:05:00.000Z');

    (chatService.addMessage as jest.Mock).mockResolvedValue({
      id: 9,
      userId: 'alice',
      chatId: 'group-1',
      message: 'nuevo',
      date,
    });

    const result = await gateway.handleNewMessage(client, {
      groupId: 'group-1',
      userId: 'alice',
      message: 'nuevo',
      date: date.toISOString(),
    });

    expect(chatService.addMessage).toHaveBeenCalledWith('alice', 'group-1', 'nuevo');
    expect((client.to as jest.Mock)).toHaveBeenCalledWith('group-1');
    expect(roomEmitter.emit).toHaveBeenCalledWith('new_message', {
      id: 9,
      userId: 'alice',
      groupId: 'group-1',
      message: 'nuevo',
      date,
    });
    expect(result.status).toBe('success');
    expect(result.data).toEqual({
      id: 9,
      userId: 'alice',
      groupId: 'group-1',
      message: 'nuevo',
      date,
    });
  });

  it('rejects message when socket user and payload user do not match', async () => {
    const gateway = new ChatGateway(chatService, jwtService);
    const { client } = buildSocket();

    await expect(
      gateway.handleNewMessage(client, {
        groupId: 'group-1',
        userId: 'bob',
        message: 'intrusion',
      }),
    ).rejects.toBeInstanceOf(WsException);
  });
});
