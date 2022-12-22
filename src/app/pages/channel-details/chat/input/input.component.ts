import { MatSnackBar } from '@angular/material/snack-bar'
import { ChannelService } from '../../../../services/channel.service'
import {
    Component,
    OnInit,
    AfterViewChecked,
    OnChanges,
    ViewChild,
    ElementRef,
    Input,
    Output,
    EventEmitter,
    Renderer2,
    SimpleChanges
} from '@angular/core'
import { ChatService } from '../../../../services/chat.service'
import { SfxService, SoundEffect } from '../../../../services/sfx.service'
import { Util } from '../../../../util/util'
import { AuthService } from '../../../../auth/auth.service'
import { Socket } from '../../../../services/socket.service'
import { lastValueFrom } from 'rxjs'

@Component({
    selector: 'app-input',
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit, OnChanges, AfterViewChecked {
    public chatMessage: string = ''
    showEmojiPicker = false

    showGiphySearch = false
    giphySearchTerm = ''
    giphyResults: any

    showAttachment = false
    fileToUpload: File = null
    fileToUploadName = ''

    isMenuOpen = false
    private user: any

    @ViewChild('fileInput')
    fileInput: ElementRef
    @ViewChild('emojiPicker', { read: ElementRef }) emojiPicker: ElementRef
    @Input() show: boolean = false
    @Input() channel: any
    @Output() sendEmoji = new EventEmitter()
    @Output() refresh = new EventEmitter()
    @Input() isOneToOneChat: boolean = false
    @Input() isGroupChat: boolean = false
    @Input() isExpanded: boolean = false
    public timer: any
    public channelId: any

    constructor(
        public chatService: ChatService,
        public channelService: ChannelService,
        private renderer: Renderer2,
        private sfxService: SfxService,
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private socket: Socket
    ) {}

    async ngOnInit() {
        this.user = this.authService.currentUser
        if (this.isOneToOneChat) {
            // this.channel.groupId = this.channel
            this.channelId = this.channel.chat.channel
        } else {
            this.channelId = this.channel._id
        }
        //   if (this.isOneToOneChat && !this.isGroupChat) this.channel._id = this.channel.user._id
        await this.getTrendingGifs()
    }

    ngAfterViewChecked() {
        if (this.emojiPicker) {
            const el = this.emojiPicker.nativeElement.querySelector('.emoji-mart')
            this.renderer.setStyle(el, 'width', '100%')
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes && changes.isExpanded) this.isExpanded = changes.isExpanded.currentValue
    }

    emitTyping($event) {
        window.clearTimeout(this.timer)
        const { keyCode } = $event
        let typingUser = {
            name: this.user.displayName,
            _id: this.user._id,
            isTyping: false,
            source2: this.channel._id,
        }
        if (typingUser) {
            if (keyCode == 13 && !$event.shiftKey) {
                $event.preventDefault()
                typingUser.isTyping = true
                this.isOneToOneChat ? this.chatService.emitChannelChatTypingByUser(typingUser)
                    : this.chatService.emitChannelChatTypingByUser(typingUser, this.channel._id)
            } else {
                typingUser.isTyping = true

                this.isOneToOneChat ? this.chatService.emitChannelChatTypingByUser(typingUser)
                    : this.chatService.emitChannelChatTypingByUser(typingUser, this.channel._id)

            }
        }
    }

    stopTyping($event) {
        window.clearTimeout(this.timer) // prevent errant multiple timeouts from being generated
        let typingUser = {
            name: this.user.displayName,
            _id: this.user._id,
            isTyping: false,
            source2: this.channel._id,
        }
        if (typingUser) {
            this.timer = window.setTimeout(() => {
                this.isOneToOneChat ? this.chatService.emitChannelChatTypingByUser(typingUser)
                    : this.chatService.emitChannelChatTypingByUser(this.channel._id, typingUser)
            }, 1000)
        }
    }

    toggleEmojiPicker() {
        this.showGiphySearch = false
        this.showAttachment = false
        this.showEmojiPicker = this.isMenuOpen = !this.showEmojiPicker
    }

    toggleGiphySearch() {
        this.showEmojiPicker = false
        this.showAttachment = false
        this.showGiphySearch = this.isMenuOpen = !this.showGiphySearch
    }

    toggleAttachment() {
        this.showGiphySearch = false
        this.showEmojiPicker = false
        this.showAttachment = this.isMenuOpen = !this.showAttachment
    }

    closeMenu() {
        this.showGiphySearch = false
        this.showAttachment = false
        this.showEmojiPicker = false
        this.isMenuOpen = false
    }

    addEmoji(event) {
        const { chatMessage } = this
        const text = chatMessage ? `${chatMessage}${event.emoji.native}` : `${event.emoji.native}`
        this.chatMessage = text
        this.sendEmoji.emit(this.chatMessage)
        this.refresh.emit(true)
    }

    async getTrendingGifs() {
        this.giphyResults = await this.chatService.getTrendingGifs()
    }

    async searchGifs() {
        if (this.giphySearchTerm) {
            this.giphyResults = await this.chatService.searchGifs(this.giphySearchTerm)
        } else {
            await this.getTrendingGifs()
        }
    }

    async seletedFiles(files: FileList) {
        this.fileToUpload = files.item(0)
        const fileSize = this.fileToUpload.size / 1024 / 1024
        if (!Util.restrictedMimeTypes.includes(this.fileToUpload.type)) {
            if (fileSize <= 15) {
                this.fileToUploadName = this.fileToUpload.name
            } else {
                this.snackBar.open('Max file size exceeded (15 MB)', null, {
                    duration: 5000
                })
                this.clearFile()
            }
        } else {
            this.snackBar.open('Unsupported file type', null, {
                duration: 5000
            })
            this.clearFile()
        }
    }

    async clearFile() {
        this.fileInput.nativeElement.value = ''
        this.fileToUpload = null
        this.fileToUploadName = ''
    }

    async sendGif(title, url) {
        const attributes = {
            userId: this.user._id,
            avatar: this.user.avatar,
            text: title,
            media: url
        }
        var completeMessage = {
            attributes: attributes,
            body: this.chatMessage || attributes['text'],
            state: { timestamp: new Date().toISOString() },
            user: this.user,
            author: this.user.displayName,
            channelId: this.channelId
        }
        if (this.isOneToOneChat && !this.isGroupChat) {
            this.chatService.updateChatProperties({
                chatId: this.channel.chat._id,
                updatedProperties: {
                    lastMessage: completeMessage.body,
                    lastMessageTimestamp: new Date()
                }
            })
            this.chatService.incrementUnreadMessageCount({
                chatId: this.channel.chat._id
            })
            this.socket.emitChatMessage({
                source1: this.user._id,
                source2: this.channel._id,
                message: completeMessage
            })
        }
        else {
            this.socket.emitMessageToChannel(this.channelId, JSON.stringify(completeMessage))
        }
        this.showGiphySearch = false
    }

    async sendMessage() {
        var attributes = {}
        if ((this.chatMessage && /\S/.test(this.chatMessage)) || this.fileToUpload) {
            if (this.fileToUpload) {
                const data = await this.chatService.postFile(this.channelId, this.fileToUpload)
                attributes = {
                    userId: this.user._id,
                    avatar: this.user.avatar,
                    text: data.name,
                    file: data.key,
                    type: data.type
                }
            } else {
                attributes = {
                    userId: this.user._id,
                    avatar: this.user.avatar,
                    text: this.chatMessage
                }
            }

            var completeMessage = {
                attributes: attributes,
                body: this.chatMessage || attributes['text'],
                state: { timestamp: new Date().toISOString() },
                user: this.user,
                author: this.user.displayName,
                channelId: this.channelId
            }
            if (!this.isGroupChat && this.isOneToOneChat) {
                this.chatService.updateChatProperties({
                    chatId: this.channel.chat._id,
                    updatedProperties: {
                        lastMessage: completeMessage.body,
                        lastMessageTimestamp: new Date()
                    }
                })

                this.chatService.incrementUnreadMessageCount({
                    chatId: this.channel.chat._id
                })

                this.socket.emitChatMessage({
                    source1: this.user._id,
                    source2: this.channel._id,
                    message: completeMessage
                })
            }
            else {
                this.socket.emitMessageToChannel(this.channelId, JSON.stringify(completeMessage))
            }
            this.chatMessage = null
            this.showEmojiPicker = false
            this.showGiphySearch = false
            this.showAttachment = false
            this.fileToUpload = null
            this.sfxService.playAudio(SoundEffect.SentMessage)
        }
    }
}
