import { LightningElement, api, wire, track } from 'lwc';
import searchusers from '@salesforce/apex/Timesheetclass.searchusers';
import { NavigationMixin } from 'lightning/navigation';
import createleave from '@salesforce/apex/Leaveclass.createleave';
import calleave from '@salesforce/apex/Leaveclass.calleave';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class Leavecomp extends NavigationMixin(LightningElement) {
  currentusername; capscurrentuser = 'RAGUPATHI M'; currentuserid;
  showulist = true; @track userList = [];
  leavedate; leavereason; totaldays; leavecount;

  navigateToTimesheet() {
    this[NavigationMixin.Navigate]({
      type: 'standard__navItemPage',
      attributes: {
        apiName: 'Timesheet_page',
      }
    });

  }

  handleUserSelection(event) {
    const selectedUserId = event.target.dataset.id;
    this.currentuserid = selectedUserId;
    console.log(this.currentuserid);
    const names = event.target.value;
    this.currentusername = names;
    this.capscurrentuser = this.currentusername.toUpperCase();
    console.log('current user' + this.currentusername);
    this.showulist = false;
    calleave({ a: this.currentuserid })
      .then(data => {
        console.log('got no of leaves');
        this.leavecount = data;
      });
  }


  handleInputChange(event) {
    this.showulist = true;
    const searchTerm = event.target.value;
    searchusers({ searchTerm })
      .then(result => {
        this.userList = result;
        console.log('success user list', result);
      })
      .catch(error => {
        console.error('error in getting user list', error);
      });
  }


  refreshPage(event) {
    window.location.reload();
  }


  handledate(event) {
    const ld = event.target.value;
    this.leavedate = ld;
    console.log(this.leavedate);
  }

  handlereason(event) {
    const lr = event.target.value;
    this.leavereason = lr;
    console.log(this.leavereason)
  }

  handlecount(event) {
    const cc = event.target.value;
    this.totaldays = cc;
    console.log(this.totaldays);
  }

  handleaddleave(event) {
        const event3 = new ShowToastEvent({
            title: 'LEAVE',
            message: 'LEAVE HAS BEEN APPLIED',
            variant: 'success'
        });
        this.dispatchEvent(event3);
    createleave({ a: this.currentuserid, b: this.leavedate, c: this.leavereason, d: this.totaldays })
      .then(data => {
        console.log('success passing leave');
      });
  }
}