import { Component, ElementRef, Input, ViewChild } from '@angular/core'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import * as _ from 'lodash'
import { AuthService } from '../../../auth/auth.service'
import { LoadingDialogComponent } from '../../../controls/loading-dialog/loading-dialog.component'
import { ChannelService } from '../../../services/channel.service'
import { WaitingRoomDialogComponent } from '../../channel-details/channel/waiting-room-dialog/waiting-room-dialog.component'

@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent {
    @ViewChild('carouselContainer', { static: true })
    carouselContainer: ElementRef

    @ViewChild('carousel') carousel: ElementRef
    @Input() animationDuration = 700
    @Input() channels: any[]

    public animating = false
    public animateDirection: -1 | 0 | 1 = 0
    
    user: any = {}
    private dialogRefLoading: MatDialogRef<LoadingDialogComponent>

    constructor(
        public dialog: MatDialog,
        private router: Router,
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private channelService: ChannelService
    ) {}

    ngOnInit() {
        this.user = this.authService.currentUser
    }
    carouselStyle() {
        const { matches: isMobile } = window.matchMedia('(max-width: 767px)')

        return {
            transform: this.animating
                ? `translateX(calc(${this.animateDirection} * (${
                      isMobile ? '65%' : '33% + 1.5rem'
                  })))`
                : 'translateX(0px)',
            transition: this.animating ? `${this.animationDuration}ms` : 'none'
        }
    }
    slideMove(index){
        if(index==1){
            this.prevSlide()
        }else if(index==3){
            this.nextSlide()
        }
    }
    nextSlide() {
        this.shiftSlide(-1)
    }

    prevSlide() {
        this.shiftSlide(1)
    }

    shiftOne(arr, direction) {
        direction > 0 ? arr.unshift(arr.pop()) : arr.push(arr.shift())
    }

    shiftSlide(direction) {
        if (this.animating) return
        this.animateDirection = direction
        this.animating = true
        setTimeout(() => {
            this.shiftOne(this.channels, direction)
            this.animating = false
            this.animateDirection = 0
        }, this.animationDuration)
    }
 
    mouseDown = false;

    startX: any;
  
    scrollLeft: any;
    startDragging(e, flag, el) {
        this.mouseDown = true;
        this.startX=e.pageX;
      }
      startDraggingTouch(e, flag, el) {
        this.mouseDown = true;
        this.startX=e.changedTouches[0].pageX;
      }
      
      stopDragging(e, flag) {
        this.mouseDown = false;
      }

      moveEvent(e, el) {
        e.preventDefault();
        if (!this.mouseDown) {
          return;
        }
         e.pageX>this.startX?this.prevSlide():this.nextSlide();
      }

      moveEventTouch(e, el) {
        e.preventDefault();
        if (!this.mouseDown) {
          return;
        }
        e.changedTouches[0].pageX>this.startX?this.prevSlide():this.nextSlide();
      }
    getImagePath(techName) {
        return this.channelService.techList
            .filter((x) => x.item_text === techName)
            .map((x) => x.item_image)
            .toString()
    }

    async showDialogOrJoin(channelData) {
        const channel = await this.channelService.getChannel({
            channelId: channelData._id
        }) 
        channelData = channel
        if (channel) {
            const isUserBlocked = await channel.blockedUsers?.some(
                (blockedUser) => blockedUser === this.user._id
            )
            if (!this.user.isAdmin && isUserBlocked) {
                this.snackBar.open('The owner of this channel has blocked you', null, {
                    duration: 5000
                })
            } else {
                if (
                    channel.isPrivate &&
                    channel.user != this.user._id &&
                    !channel?.notificationSubscribers?.includes(this.user._id)
                ) {
                    this.showWaitingRoomDialog(channelData)
                } else {
                    this.showLoadingDialog()
                    this.router.navigate(['/channel', channel._id])
                    this.closeLoadingDialog()
                }
            }
        } else {
            this.snackBar.open("This channel doesn't exist anymore", null, {
                duration: 5000
            })
        }
    }

    showWaitingRoomDialog(channelData) {
        this.dialog.open(WaitingRoomDialogComponent, {
            width: '400px',
            data: {
                channel: channelData
            },
            autoFocus: false
        })
    }

    showLoadingDialog() {
        this.dialogRefLoading = this.dialog.open(LoadingDialogComponent, {
            width: '300px',
            data: {
                message: 'Joining channel...'
            }
        })
    }

    closeLoadingDialog() {
        this.dialogRefLoading.close()
    }



}
