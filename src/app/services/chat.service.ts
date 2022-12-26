import { lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { MatSnackBar } from '@angular/material/snack-bar'
import { UserService } from './user.service'
import { Socket } from './socket.service'
import { NotificationService } from './notification.service'
import { environment } from '../../environments/environment'
import { AuthService } from '../auth/auth.service'
import { ChannelService } from './channel.service'
import { MatDialog } from '@angular/material/dialog'
import { DialogService } from './dialog.service'
import { DialogData } from '../shared/dialog-data'
import { FollowService } from './follow.service'
import { runInThisContext } from 'vm'

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    public chats: any = []
    public searchQuery: string = ''
    public messages: any = []
    public isGettingMessages: Boolean = false
    public lastMessageSendDate: Date = new Date()
    public error: string
    private skip: any
    private limit: any
    public isShowingSearchResults: boolean = false
    public isChatsEnabled: boolean = false
    public activeTabs: any[] = []
    public initIncomingMessage: any

    constructor(
        public http: HttpClient,
        private snackBar: MatSnackBar,
        private userService: UserService,
        private notificationService: NotificationService,
        private socket: Socket,
        private authService: AuthService,
        private channelService: ChannelService,
        public dialog: MatDialog,
        private dialogService: DialogService,
        private followService: FollowService
    ) {
        this.resetSkipLimit()
    }

    resetSkipLimit() {
        this.skip = 0
        this.limit = 100
    }

    deleteMessage(message, channelId) {
        this.socket.emitDeleteMessageToChannel(channelId, JSON.stringify(message))
    }

    deleteAllMessages(channelId) {
        this.socket.emitDeleteAllMessagesToChannel(channelId)
    }

    async postFile(channelId: string, fileToUpload: File): Promise<any> {
        /* return await lastValueFrom(this.http
            .post(`${environment.apiUrl}/attachments/file?channelId=${channelId}&name=${fileToUpload.name}&type=${fileToUpload.type}`,
            fileToUpload)) */
           const response = await fetch(`${environment.apiUrl}/attachments/file?channelId=${channelId}&name=${fileToUpload.name}&type=${fileToUpload.type}`, {
                method: "POST",
                body: fileToUpload,
                // 👇 Set headers manually for single file upload
                // content-type & content-length are automatically set by browser
                headers: {
                  "content-type": fileToUpload.type,
                  "content-length": `${fileToUpload.size}`, // 👈 Headers need to be a string
                  "content-disposition": `attachment; filename = ${fileToUpload.name}`,
                  Authorization: localStorage.getItem('jwt'),
                  userId: localStorage.getItem('userId')
                },
              })
        return await response.json()
    }

    async deleteFile(key: string): Promise<any> {
        return await lastValueFrom(this.http
            .delete(`${environment.apiUrl}/attachments/file?key=${key}`, {}))
            .then((res) => {
                return res
            })
    }

    async getTrendingGifs(): Promise<any> {
        return await lastValueFrom(this.http.get(`${environment.apiUrl}/giphy/trending`))
    }

    async searchGifs(query): Promise<any> {
        return await lastValueFrom(this.http
            .get(`${environment.apiUrl}/giphy/search`, { params: { query } }))
    }

    async getMessages(chat, chatType) {
        this.isGettingMessages = true
        var data = { limit: this.limit, skip: 0 }
        if (chatType == 'channelChat') {
            this.skip = this.skip + this.limit
            data.skip = this.skip
            this.socket.emitHistoryToChannel(chat.channel, data.skip)
        } else if (chatType == 'oneToOneChat') {
            data.skip = chat.skip
        }

    }

    async sendChannelMessage(channel, attributes): Promise<any> {
        const dateNow = new Date()
        const diff = Math.round(
            Math.abs((dateNow.getTime() - this.lastMessageSendDate.getTime()) / 1000)
        )
        if (diff <= 0.7) {
            this.snackBar.open('Please be courteous to other users', null, {
                duration: 1000
            })
            return Promise.resolve()
        } else {
            const user = this.authService.currentUser
            attributes.userId = user._id
            attributes.avatar = user.avatar
            var completeMessage = {
                attributes: attributes,
                body: attributes.text,
                state: { timestamp: new Date().toISOString() },
                user: user,
                author: user.displayName
            }
            this.socket.emitMessageToChannel(channel._id, completeMessage)
            this.lastMessageSendDate = new Date()
            this.sendEmailAndWebNotifications(channel, user, attributes)
        }
    }

    async sendChatMessage(chat, attributes): Promise<any> {
        const user = this.authService.currentUser
        attributes.userId = user._id
        attributes.avatar = user.avatar
        var completeMessage = {
            attributes: attributes,
            body: attributes.text,
            state: { timestamp: new Date().toISOString() },
            user: user,
            author: user.displayName
        }
        this.socket.emitChatMessage({ source1: chat.source1, source2: chat.source2, message: completeMessage })
        this.lastMessageSendDate = new Date()
        this.sendEmailAndWebNotifications(chat._id, user, attributes)

    }

    async sendEmailAndWebNotifications(channel, user, attributes) {
        let notificationSubscribers = []
        notificationSubscribers = channel?.notificationSubscribers?.filter((id) =>
            id == user._id ? false : true
        )
        if (notificationSubscribers?.length) {
            const sendNotificationsTo = []
            // const sendEmailsTo = []
            notificationSubscribers = await this.userService.getUsersByIds(notificationSubscribers)
            notificationSubscribers.forEach((user) => {
                if (user.isWebNotificationsEnabled) sendNotificationsTo.push(user._id)
                // if (user.isEmailNotificationsEnabled) sendEmailsTo.push(user._id)
            })
            const body = `${user.customUsername}: ${attributes.text}`
            const title = `New message at ${channel.title}`
            var sendToList = []
            if (sendNotificationsTo.length) {
                sendToList.push(
                    this.notificationService.sendWebNotifications({
                        body,
                        title,
                        userIds: sendNotificationsTo
                    })
                )
            }
            // if (sendEmailsTo.length) {
            //   sendToList.push(this.notificationService.sendEmails({
            //     subject: `Chat notification from codecrow.io`, message: body, name: channel.title, userIds: sendEmailsTo, url: `${environment.hostUrl}/channel/${channel._id}`
            //   }))
            // }
            return Promise.all(sendToList)
        } else {
            return Promise.resolve()
        }
    }

    emitChannelChatTypingByUser(typingUser, channelId?) {
        if (!channelId) {
            this.socket.emitChatTypingByUser(typingUser)
        }
        else {
            this.socket.emitChannelChatTypingByUser(channelId, typingUser)
        }
    }

    async createChat({ source1, source2, user }): Promise<any> {
        const chat: any = await lastValueFrom(this.http
            .put(`${environment.apiUrl}/chats`, {
                source1,
                source2,
            }))
        const doesChatExist = this.chats.some((cht) => chat._id === cht._id)
        if (!doesChatExist) this.chats.push(chat)
        return chat
    }

    async getChat({ source1, source2 }): Promise<any> {
        return await lastValueFrom(this.http
            .get(`${environment.apiUrl}/chats/me`, { params: { source1, source2 } }))
    }

    async getChats(isRefresh = false) {
        if (isRefresh) {
            this.chats = []
            this.resetSkipLimit()
        }
        const chats: any = await lastValueFrom(this.http
            .get(`${environment.apiUrl}/chats`, {
                params: {
                    searchQuery: this.searchQuery,
                    skip: this.skip,
                    limit: this.limit
                }
            }))
        if (chats.length) {
            this.skip += this.limit
            this.chats.push(...chats)
        } else {
            if (this.searchQuery && !this.skip)
                this.snackBar.open('No results with the search criteria', null, {
                    duration: 2000
                })
        }
        return this.chats
    }

    async deleteChat({ chat }) {
        const dialogData: DialogData = {
            title: 'Delete Chat',
            message: 'Are you sure you want to delete this chat?',
            okText: 'Yes',
            cancelText: 'Cancel'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                await lastValueFrom(this.http
                    .delete(`${environment.apiUrl}/chats`, {
                        params: { chatId: chat._id }
                    }))
                this.chats = this.chats.filter((cht) => cht.chat._id !== chat._id)
            }
        })
    }

    async updateChatProperties({ chatId, updatedProperties }): Promise<any> {
        return await lastValueFrom(this.http
            .patch(`${environment.apiUrl}/chats?chatId=${chatId}`, updatedProperties))
    }

    async incrementUnreadMessageCount({ chatId }): Promise<any> {
        return await lastValueFrom(this.http
            .patch(`${environment.apiUrl}/chats/unread?chatId=${chatId}`, {}))
    }

    async clearUnreadMessageCount({ chatId }): Promise<any> {
        return await lastValueFrom(this.http
            .delete(`${environment.apiUrl}/chats/unread?chatId=${chatId}`, {}))
    }

    async searchChats(): Promise<any[]> {
        try {
            this.chats = []
            return this.getChats(true)
        } catch (e) {
            console.log(e)
        }
    }

    async openChat(chat, friendGroup = null) {
        if (friendGroup) {
            return this.activateGroupTab(friendGroup)
        }
        if (!chat.chat) {
            const existingChat = await this.getChat({
                source1: this.authService.currentUser._id,
                source2: chat._id
            })
            if (!existingChat) {
                chat = await this.createChat({
                    source1: this.authService.currentUser._id,
                    source2: chat._id,
                    user: chat
                })
            } else {
                chat = existingChat
            }
        }
        this.activateChatTab(chat)
        this.socket.emitChatMessage({
            source1: this.authService.currentUser._id,
            source2: chat._id,
            message: "incoming message"
        })

    }

    async activateChatTab($chat) {
        const user = this.authService.currentUser
        if (this.checkAlreadyExist($chat)) return
        this.activeTabs.push($chat)
        await this.clearUnreadMessageCount({ chatId: $chat.chat._id })
        $chat.chat.unreadMessageCount = 0
    }

    async activateGroupTab($group) {
        const user = this.authService.currentUser
        if (this.checkAlreadyExist($group)) return
        this.socket.emitChannelSubscribeByUser($group.channelId, user._id)
        this.activeTabs.push($group)
    }

    checkAlreadyExist(item) {
        let chat = this.activeTabs.find((chat) => {
            if (chat._id === item._id || ((chat.source1 === item.source1 && chat.source2 === item.source2) ||
                (chat.source2 === item.source1 && chat.source1 === item.source2))) {
                return true
            }
        })
        return (this.activeTabs.indexOf(item) !== -1) || (chat !== undefined)
    }

    async incomingMessageActivateChatTab(data: any) {
        const user = this.authService.currentUser
        const otherUser = this.userService.getUserById(data.source1)
        var chat = null
        const existingChat = await this.getChat({
            source1: this.authService.currentUser._id,
            source2: data.source1
        })
        if (!existingChat) {
            chat = await this.createChat({
                source1: this.authService.currentUser._id,
                source2: data.source1,
                user: otherUser
            })
        } else {
            chat = existingChat
        }
        if (!user.isDoNotDisturbEnabled) {
            chat.isUserRequestingToOpenChat = true
            this.initIncomingMessage = data
            this.activateChatTab(chat)
        }
    }

    async blockUser(senderId, isBlocked) {
        try {
            await this.channelService.blockUserFromChannel({
                channelId: this.channelService.currentChannel._id,
                userId: senderId
            })
            await this.channelService.removeChannelNotificationSubscriber({
                channelId: this.channelService.currentChannel._id,
                userId: senderId
            })
            this.socket.emitRemovedUser(this.channelService.currentChannel._id, senderId)
            this.channelService.currentChannel.blockedUsers?.push(senderId)
            isBlocked = this.channelService.isUserBlockedFromChannel(senderId)
        } catch (e) {
            console.log(e)
        }
    }

    async unblockUser(senderId, isBlocked) {
        try {
            await this.channelService.unblockUserFromChannel({
                channelId: this.channelService.currentChannel._id,
                userId: senderId
            })
            this.channelService.currentChannel.blockedUsers =
                this.channelService.currentChannel.blockedUsers?.filter(
                    (user) => !!(user != senderId)
                )
            isBlocked = this.channelService.isUserBlockedFromChannel(senderId)
        } catch (e) {
            console.log(e)
        }
    }

    async showDeleteMessageDialog(oneVone, message) {
        const dialogData: DialogData = {
            title: 'Delete Message',
            message: 'Are you sure you want to delete this message?',
            okText: 'Yes',
            cancelText: 'Cancel'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.commitDeleteMessage(oneVone, message)
            }
        })
    }

    async commitDeleteMessage(oneVone, message) {
        try {
            let channel = null
            if (oneVone || !this.channelService.currentChannel) {
                channel = { _id: message.channelId } // if friend chat
            } else {
                channel = this.channelService.currentChannel // if channel chat
            }
            if (channel) {
                this.deleteMessage(message, channel._id)
            }
        } catch (e) {
            console.log(e)
        }
    }

    async toggleFollow(follow, senderId, userId) {
        if (follow) {
            if (!follow.isFollowing) {
                await this.followService.createFollow({
                    source1: senderId,
                    source2: userId
                })
                follow.isFollowing = true
            } else {
                await this.followService.deleteFollow({
                    source1: senderId,
                    source2: userId
                })
                follow.isFollowing = false
            }
        }
    }
}
