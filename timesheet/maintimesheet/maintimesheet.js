import { LightningElement, track, wire,api } from 'lwc';
import searchusers from '@salesforce/apex/Timesheetclass.searchusers';
import searchweeks from '@salesforce/apex/Timesheetclass.searchweeks';
import searchdates from '@salesforce/apex/Timesheetclass.searchdates';
import searchleaves from '@salesforce/apex/Timesheetclass.searchleaves';
import existingtasks from '@salesforce/apex/Timesheetclass.existingtasks';
import addtasks from '@salesforce/apex/Timesheetclass.addtasks';
import addprojects from '@salesforce/apex/Timesheetclass.addprojects';
import addnewtaskproj from '@salesforce/apex/Timesheetclass.addnewtaskproj';
import addition from '@salesforce/apex/Timesheetclass.addition';
import newwtime from '@salesforce/apex/Timesheetclass.newwtime';
import createWweek from '@salesforce/apex/Timesheetclass.createWweek';
import checkts from '@salesforce/apex/Timesheetclass.checkts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';



export default class maintimesheet extends NavigationMixin(LightningElement) {
    @api Timesheet_Dash;
    @track userList = [];
    @track weekList = [];
    @track columns = []; @track data = [];
    weekid; weekname; startdate; enddate; newcurrenttask = [];
    currentuserid; currentusername;
    currentproject; currenttask;
    showulist = true; showwlist = true; showtable = false; showaddbutton = true;
    showpopup = false; showtaddrow = false; showpaddrow = false;
    newtask = []; newproject = [];
    @track tasks = []; @track nowtasks = []; currentaskduration;
    totalexistrows; totalnewrow; searchitem;
    leaves = []; rowids = []; sum = []; finalstring = 'no';
    capscurrentuser = 'RAGUPATHI M'; lastcount = 0;
    deletevalue = 0; newcount = 0; savebutton = 0; columnSum = 0;


    //navigate to leave application----------------------------------------------------
    navigateToLeave() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Leavepage'
            }
        });
    }


    //navigate to report page------------------------------------------------------------
    gotoreport(){
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Timesheet_Dash'
            }
        });
    }


    //search keyword----------------------------------------------------------------------
    handlesearchitemchange(event) {
        this.searchitem = event.target.value;
        const elementsToSearch = Array.from(document.querySelectorAll('mainpage'));
        elementsToSearch.forEach((element) => {
            const elementText = element.textContent || element.innerText || '';
            if (elementText.includes(this.searchitem)) {
                element.classList.add('highlighted');
            } else {
                element.classList.remove('highlighted');
            }
        });
    }


    //blur on add row popup----------------------------------------------------------------
    get mainPageStyle() {
        return this.showpopup ? 'filter:blur(2px)' : '';
    }


    //refreshpage-------------------------------------------------------------------------
    refreshPage(event) {
        window.location.reload();
    }

    //user input--------------------------------------------------------------------------
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


    //user selection-----------------------------------------------------------------------
    handleUserSelection(event) {
        const selectedUserId = event.target.dataset.id;
        this.currentuserid = selectedUserId;
        console.log(this.currentuserid);
        const names = event.target.value;
        this.currentusername = names;
        this.capscurrentuser = this.currentusername.toUpperCase();
        console.log('current user' + this.currentusername);
        this.showulist = false;
    }


    //week input--------------------------------------------------------------------------
    handleweekChange(event) {
        this.showwlist = true;
        const searchTerm = event.target.value;
        searchweeks({ searchTerm })
            .then(result => {
                this.weekList = result;
                console.log('success week list', result);
            })
            .catch(error => {
                console.error('error in getting week list', error);
            });
    }


    //week selection------------------------------------------------------------------------
    handleWeekSelection(event) {
        const selectedweekId = event.target.dataset.id;
        this.weekid = selectedweekId;
        console.log(this.weekid);
        const weeks = event.target.value;
        this.weekname = weeks;
        console.log('current week' + this.weekname);
        this.showwlist = false;
    }


    //show new row popup--------------------------------------------------------------------
    addrow(event) {
        this.showpopup = true;
    }

    addweek(event) {
        createWweek();
        const event5 = new ShowToastEvent({
            title: 'NEW WEEK',
            message: 'WEEK HAS BEEN ADDED',
            variant: 'success'
        });
        this.dispatchEvent(event5);
    }


    handleclose() {
        this.showpopup = false;
    }


    //find current users projects----------------------------------------------------------
    handlepchanges(event) {
        const searchp = event.target.value;
        addprojects({ a: this.currentuserid, b: searchp })
            .then(data => {
                this.newproject = data;
                console.log('found users projects');
            })
            .catch(error => {
                console.log('error in getting users projects', error);
            });
        this.showpaddrow = true;
    }


    //find current projects tasks----------------------------------------------------------
    handletchanges(event) {
        const searcht = event.target.value;
        addtasks({ a: this.currentproject, b: searcht, c: this.currentuserid })
            .then(data => {
                this.newtask = data;
                console.log('found users tasks');
            })
            .catch(error => {
                console.log('error in getting users tasks', error);
            });
        this.showtaddrow = true;
    }


    //assign tasks n projects to new row-----------------------------------------------------
    assignprow(event) {
        this.currentproject = event.target.value;
        console.log('current project' + this.currentproject);
        this.showpaddrow = false;
    }

    assigntrow(event) {
        this.currenttask = event.target.value;
        console.log('current task' + this.currenttask);
        this.showtaddrow = false;
    }


    //add new row-----------------------------------------------------------------------------
    handleadd() {
        const event3 = new ShowToastEvent({
            title: 'NEW ROW',
            message: 'NEW ROW HAS BEEN ADDED',
            variant: 'success'
        });
        this.dispatchEvent(event3);
        this.newcount += 1;
        addnewtaskproj({ a: this.currentproject, b: this.currenttask })
            .then(data => {
                const dd = data;
                dd.forEach(a => {
                    console.log('adding new row');
                    console.log(a.Name);
                    console.log(a.Project__r.Name);

                    let newRow = {
                        id: String(this.data.length + 1),
                        column0: a.Project__r.Name,
                        column1: a.TaskId__c,
                        column2: a.Name,
                        column3: a.Status__c,
                        column4: a.Duration__c,
                        column5: 0,
                    };

                    this.data.splice(this.data.length, 0, newRow);
                    this.data = [...this.data];
                    this.totalnewrow += 1
                    addition({ a: this.weekid, b: this.currenttask })
                        .then(data => {
                            const newtime1 = data;
                            console.log(JSON.stringify(newtime1));
                        })
                    this.addcolumntotal();
                    this.billchanges();
                });
            });
        this.showpopup = false;
    }

    connectedCallback(){
        if (this.lastcount === 0) {
            this.currentuserid = '0055i00000BaRa9AAF';
            this.weekid = 'a085i00000IzQfGAAV';
            this.currentusername='Current User';
            this.weekname='Current week';
            this.handlesearchclick();
        }
    }


    //search button--------------------------------------------------------------------------
    handlesearchclick(event) {
        this.lastcount+=1;
        this.sum = [];
        this.nowtasks = [];
        this.showaddbutton = true;
        this.showtable = true;
        this.rowids = [];
        this.data = [];
        this.newcurrenttask = [];
        this.leaves = [];
        this.totalnewrow = 0;
        this.totalexistrows = 0;
        this.columns =
            [
                {
                    label: 'PROJECT', fieldName: 'column0', type: 'button', editable: true, fixedWidth: 125, typeAttributes: { label: { fieldName: 'column0' }, name: 'view1', variant: 'inverse' },
                    cellAttributes: { style: 'color: white;height:2cm;background-color: rgba(56, 103, 198, 0.797);border-radius: 3px;border:1px white black;box-shadow: 5px 0px 5px 0px rgba(0,0,0,0.2);' }
                },
                {
                    label: 'PAN', fieldName: 'column1', editable: true, fixedWidth: 100,
                    cellAttributes: { style: 'color: white;background-color: #383838;border-radius: 3px;border:1px solid white;box-shadow: 5px 0px 5px 0px rgba(0,0,0,0.2);' }
                },
                {
                    label: 'TASK', fieldName: 'column2', type: 'button', editable: true, fixedWidth: 120, typeAttributes: { label: { fieldName: 'column2' }, name: 'view2', variant: 'inverse' },
                    cellAttributes: { style: 'color: white;background-color: rgba(56, 103, 198, 0.797);border-radius: 3px;border:1px solid white;box-shadow: 5px 0px 5px 0px rgba(0,0,0,0.2);' }
                },
                {
                    label: 'TASK COMPLETION', fieldName: 'column3', editable: true, fixedWidth: 100,
                    cellAttributes: { style: 'color: white;background-color: #383838;border-radius: 3px;border:1px solid white;box-shadow: 5px 0px 5px 0px rgba(0,0,0,0.2);' }
                },
                {
                    label: 'HOURS', fieldName: 'column4', editable: true, fixedWidth: 120,
                    cellAttributes: { style: 'color: white;background-color: #383838;border-radius: 3px;border:1px solid white;box-shadow: 5px 0px 5px 0px rgba(0,0,0,0.2);' }
                },
                {
                    label: 'TRACK TIME', fieldName: 'column5', editable: true, fixedWidth: 200,
                    cellAttributes: { style: 'color:white;background-color: #383838;border-radius: 3px;border:1px solid white;box-shadow: 5px 0px 5px 0px rgba(0,0,0,0.2);' }
                },
            ];


        //search leaves--------------------------------------------------------------------------
        searchleaves({ a: this.currentuserid, b: this.weekid })
            .then(data => {
                this.leaves = data;
                this.leaves.forEach(a => {
                    console.log(a);
                })
                console.log('found leaves');
            })


        //add columns of date for week------------------------------------------------------------
        searchdates({ a: this.weekid })
            .then(data => {
                const ss = data.Startdate__c;
                const ee = data.Enddate__c;
                const jj = ['MODAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
                for (var i = 0; i < 7; i++) {
                    let dd = new Date(data.Startdate__c);
                    dd.setDate(dd.getDate() + i);
                    var formattedStartDate = dd.getFullYear() + '-' +
                        ('0' + (dd.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + dd.getDate()).slice(-2) + '|' + jj[i];
                    let hh = i + 6;

                    //excluding leave------------------------------------------------------------------------
                    let isleave = false;
                    for (let j = 0; j < this.leaves.length; j++) {
                        console.log(formattedStartDate + '   ' + this.leaves[j]);
                        if (formattedStartDate.startsWith(this.leaves[j])) {
                            console.log('leave day on ' + formattedStartDate);
                            isleave = true;
                            break;
                        }
                    }

                    //add date columns--------------------------------------------------------------------------
                    if (!isleave && i < 5) {
                        const newColumn2 = {
                            label: formattedStartDate, fieldName: 'column' + hh, editable: true, intialWidth: 130,
                            cellAttributes: { style: 'color: black;border-radius: 3px;border:1px solid black;' }
                        };
                        this.columns = [...this.columns, newColumn2];
                    }
                    else if (i > 4) {
                        const newColumn3 = {
                            label: formattedStartDate, fieldName: 'column' + hh, editable: true, intialWidth: 120,
                            cellAttributes: { style: 'background-color: #C8C8C8;border-radius: 3px;height: 1cm;border:1px solid black;' }
                        };
                        this.columns = [...this.columns, newColumn3];
                    }
                    else {
                        const newColumn = {
                            label: formattedStartDate, fieldName: 'column' + hh, editable: false, intialWidth: 130,
                            cellAttributes: { style: 'background-color: #C8C8C8;border-radius: 3px;height: 1cm;border:1px solid black;' }
                        };
                        this.columns = [...this.columns, newColumn];
                    }
                }


                //add delete column------------------------------------------------------------------------------
                this.columns.push({
                    label: 'TOTAL', fieldName: 'total', editable: false, fixedWidth: 100,
                    cellAttributes: { style: 'color: white;background-color: #383838;border-radius: 3px;border:1px solid white;' }
                });
                this.columns.push(
                    {
                        label: 'Delete',
                        type: 'button',
                        fixedWidth: 100,
                        cellAttributes: { style: 'color: black;border-radius: 3px;border:1px solid black;background-color:rgba(198, 34, 34, 0.948);' },
                        typeAttributes: {
                            label: 'Delete',
                            title: 'Delete',
                            name: 'delete',
                            variant: 'inverse',
                            alternativeText: 'Delete',
                        },
                    });
                console.log('sdate:' + ss);
                console.log('edate:' + ee);
            })
            .catch(error => {
                console.log('error in getting dates', error);
            });


        //existing row--------------------------------------------------------------------------
        existingtasks({ a: this.currentuserid, b: this.weekid })
            .then(data => {
                this.nowtasks = data;
                let newnewrow;
                let count = 0;

                this.nowtasks.forEach((task, index) => {
                    const project = task.Project__r.Name;
                    const proid = task.Task__r.TaskId__c;
                    const taskName = task.Task__r.Name;
                    const maindate = task.Wdate__r.Date__c;
                    const wh = task.Workedhrs__c;
                    let taskid = task.Task__c;
                    this.totalexistrows += 1;
                    const taskdura = task.Duration__c;
                    let timetrack = 0;


                    //find dup of taskid----------------------------------------------------------------
                    let isDuplicate = false;
                    for (let i = 0; i < this.newcurrenttask.length; i++) {
                        if (taskid === this.newcurrenttask[i]) {
                            isDuplicate = true;
                            break;
                        }
                    }


                    //add a new row---------------------------------------------------------------------
                    if (!isDuplicate) {
                        this.newcurrenttask.push(taskid);
                        console.log('Task ID added: ' + taskid);
                        newnewrow = {
                            id: String(index - count + 1),
                            column0: project,
                            column1: proid,
                            column2: taskName,
                            column4: taskdura,
                            column5: timetrack,
                        };


                        //add columns in new row--------------------------------------------------------------
                        const newcol2 = [...this.columns];
                        let nm;
                        newcol2.forEach(c => {
                            console.log(c.label);
                            console.log(maindate);
                            if (c.label.startsWith(maindate)) {
                                nm = c.fieldName;
                                console.log(nm);
                            }
                        });
                        newnewrow[nm] = wh;

                        this.data.splice(this.data.length, 0, newnewrow);
                        this.data = [...this.data];
                    }


                    //add workedhrs in old newrow-----------------------------------------------------------------
                    else {
                        count += 1;
                        const newcol2 = [...this.columns];
                        let nm;
                        newcol2.forEach(c => {
                            if (c.label.startsWith(maindate)) {
                                nm = c.fieldName;
                            }
                        });
                        //if(newnewrow[nm]>0 && wf>0){newnewrow[nm]+= wh;}
                        newnewrow[nm] = wh;
                        console.log(nm + '-----' + wh);
                        console.log('Duplicate found: ' + taskid);
                    }
                });

                console.log('assigned Wtime');
                console.log('totalexistingrows=' + this.totalexistrows);
                this.addcolumntotal();
                this.billchanges();
                this.checktss();
            })
            .catch(error => {
                console.log('error in getting nowtasks' + error);
            });
    }

    checktss() {
        //timesheet edit check---------------------------------------------------------------------
        this.finalstring = 'no';
        checkts({ a: this.currentuserid, b: this.weekid, j: this.finalstring })
            .then(data => {
                const checking = data;
                if (checking === 'noedit') {
                    this.showaddbutton = false;
                    const event = new ShowToastEvent({
                        title: 'SAVED TIMESHEET',
                        message: 'YOUR TIMESHEET HAS ALREADY BEEN SAVED: NO EDIT ACCESS',
                        variant: 'destructive'
                    });
                    this.dispatchEvent(event);
                    this.columns.pop();
                    //this.columns=[...this.columns];
                    this.columns = this.columns.map(column => ({
                        ...column,
                        editable: false
                    }));
                }
            });
    }



    //add row-column-bills totals-------------------------------------------------------------------
    addcolumntotal() {
        this.columnSum=0;
        this.sum = [];
        const usedata = [...this.data];
        let tot6 = 0; let tot7 = 0; let tot8 = 0; let tot9 = 0; let tot10 = 0; let tot11 = 0; let tot12 = 0;
        usedata.forEach(a => {
            let s0 = 0; let s2 = 0; let s1 = 0; let s3 = 0; let s5 = 0; let s6 = 0; let s4 = 0;
            if (a.column6 >= 0) { s0 = parseInt(a.column6, 10); };
            if (a.column7 >= 0) { s1 = parseInt(a.column7, 10); };
            if (a.column8 >= 0) { s2 = parseInt(a.column8, 10); };
            if (a.column9 >= 0) { s3 = parseInt(a.column9, 10); };
            if (a.column10 >= 0) { s4 = parseInt(a.column10, 10); };
            if (a.column11 >= 0) { s5 = parseInt(a.column11, 10); };
            if (a.column12 >= 0) { s6 = parseInt(a.column12, 10); };


            a.total = s0 + s1 + s2 + s3 + s4 + s5 + s6;
            tot6 += s0;
            tot7 += s1;
            tot8 += s2;
            tot9 += s3;
            tot10 += s4;
            tot11 += s5;
            tot12 += s6;
            this.columnSum += a.total;
        })
        this.sum.push(tot6, tot7, tot8, tot9, tot10, tot11, tot12);
    }


    //bill/non bill change-------------------------------------------------------------------
    billchanges() {
        const billdata = [...this.data];
        billdata.forEach(record => {
            let rc = 0; let rc2 = 0;
            if (record.column4 > record.total) {
                rc = record.total;
                record.column3 = 'Inprogress';
            }
            else if (record.column4 == record.total) {
                rc = record.total;
                record.column3 = 'Completed';
            }
            else {
                rc = record.column4;
                rc2 = record.total - record.column4;
                record.column3 = 'Delayed';
            }
            record.column5 = '(TD-' + record.column4 + ')' + '/TT-' + record.total + ')-(B-' + rc + ')-(NB-' + rc2 + ')';
        });
    }


    //on cell click save---------------------------------------------------------------------------
    handlesave(event) {
        this.savebutton += 1;
        console.log('-------------------------------');
        const alldata = [...this.data];
        const mains2 = alldata.map((record) => {
            const ghgh2 = event.detail.draftValues.find((value) => value.id === record.id);
            if (ghgh2 != null) {
                Object.entries(ghgh2).forEach(([fieldName, savedValue]) => {
                    const column = this.columns.find((col) => col.fieldName === fieldName);
                    if (column) {
                        savedValue = parseInt(savedValue, 10);
                        const columnLabel = column.label;
                        console.log(columnLabel, savedValue);
                        record[fieldName] = savedValue;
                        console.log(record[fieldName]);
                        this.sum = [];
                        let compsum;
                        this.addcolumntotal();

                        let rowinfo = [];
                        for (let i = 6; i < 12; i++) {
                            if (fieldName === 'column' + i) {
                                compsum = this.sum[i - 6];
                                console.log(compsum);
                            }
                        }

                        //if cell change is true-------------------------------------------------------------------
                        if (compsum < 25 && compsum > 0) {
                            const event = new ShowToastEvent({
                                title: 'SAVE NEW VALUE',
                                message: 'RECORD UPDATED',
                                variant: 'success'
                            });
                            this.dispatchEvent(event);
                            console.log('assigned values');
                            this.billchanges();
                            record[fieldName] = savedValue;
                            rowinfo.push(columnLabel, savedValue, record.column1);
                            let dood = JSON.stringify(rowinfo);
                            console.log(dood);
                            newwtime({ a: dood })
                                .then(data => {
                                    console.log('success in passing newwtime')
                                })
                                .catch(error => {
                                    console.log('error in passing newwtime', error);
                                });
                        }


                        //if cell change is false------------------------------------------------------------------
                        else {
                            const event = new ShowToastEvent({
                                title: 'SAVE NEW VALUE',
                                message: 'DAY LIMIT : 24 HOURS',
                                variant: 'destructive'
                            });
                            this.dispatchEvent(event);
                            console.log('error in greater');
                            record.total = record.total - savedValue;
                            record[fieldName] = 0;
                        }
                    }
                });
            }
            return record;
        });


        //update row data---------------------------------------------------------------------------------
        const updatedData = [...this.data];
        event.detail.draftValues.forEach((editedRecord) => {
            const existingRecord = updatedData.find((record) => record.id === editedRecord.id);
            if (existingRecord) {
                existingRecord.name = editedRecord.name;
                existingRecord.cancel = false;
            }
        });
        this.data = updatedData;
    }



    //delete row/navigate to recordid page-------------------------------------------------------------------------------------
    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        const proname = row.column0;
        const taskname = row.column2;
        let ghgh = []; let tasksids; let prosids;
        addnewtaskproj({ a: proname, b: taskname })
            .then(data => {
                ghgh = data;
                ghgh.forEach(a => {
                    tasksids = a.Id;
                    prosids = a.Project__c;
                    console.log(tasksids + '  ' + prosids);
                    if (action.name === 'view1' || action.name === 'view2') {
                        console.log('executing view1/view2');
                        this[NavigationMixin.Navigate]({
                            type: 'standard__recordPage',
                            attributes: {
                                recordId: tasksids,
                                actionName: 'view'
                            }
                        });
                    }
                });
            })
            .catch(error => {
                console.log('error in ghgh', error);
            });

        if (action.name === 'delete') {
            console.log('executing delete');
            this.deletevalue += 1;
            this.deleteRow(row);
        }
    }

    //delete action-------------------------------------------------------------------------------------
    deleteRow(row) {
        const event = new ShowToastEvent({
            title: 'ROW DELETION',
            message: 'ROW HAS BEEN DELETED',
            variant: 'error'
        });
        this.dispatchEvent(event);
        this.data = this.data.filter(item => item.id !== row.id);
    }


    //disable editing-------------------------------------------------------------------------------------
    disableEditing(event) {
        this.finalstring = 'yes';
        checkts({ a: this.currentuserid, b: this.weekid, j: this.finalstring })
        const event2 = new ShowToastEvent({
            title: 'DISABLE EDITING',
            message: 'YOU DONT HAVE ACCESS TO EDIT HEREAFTER',
            variant: 'error'
        });
        this.dispatchEvent(event2);
        this.showaddbutton = false;
        this.columns = this.columns.map(column => ({
            ...column,
            editable: false
        }));
    }


    //csv download---------------------------------------------------------------------------------------------
    handleDownload() {
        const csvContent = this.convertToCSV(this.data);
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodedUri);
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    convertToCSV(data) {
        const header = this.columns.slice(0, -1).map(column => column.label);
        const rows = data.map(row => {
            return this.columns.slice(0, -1).map(column => {
                if (row[column.fieldName] != null) {
                    return row[column.fieldName];
                }
                else {
                    return 0;
                }
            });
        });

        let csvContent = `${header.join(',')}\n`;
        csvContent += rows.map(row => row.join(',')).join('\n');
        return csvContent;
    }
}