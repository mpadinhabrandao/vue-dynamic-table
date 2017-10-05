<template>
    <div>
    {{IcheckedRows}}
        <table >
            <thead >
                <tr>
                    <th v-if="checkRows">
                        <input type="checkbox" :checked="IcheckedRowsToggle" @change="IcheckedRowsToggle = !IcheckedRowsToggle" />
                    </th>
                    <template v-for="ifield in IshowFields" >
                        <th 
                            :class=" [ifield,{ 'col-order' : Ifields[ifield].sortable }, (ifield == IorderBy) ? ((Iorder == 'DESC') ? 'desc' : 'asc'): '']" 
                            :data-key="ifield"
                            @click="colOrdering(ifield)"
                            draggable="true"
                            @dragstart="handleDragStart"
                            @dragenter="handleDragEnter"
                            @dragover="handleDragOver"
                            @dragleave="handleDragLeave"
                            @drop="handleDrop"
                            @dragend="handleDragEnd"
                        >
                            {{Ifields[ifield].label}}
                        </th>
                    </template>
                </tr>
                <tr>
                    <th v-if="checkRows"></th>
                    <th v-for="ifield in IshowFields" :class=" [ifield]">
                        <template v-if="Ifields[ifield].filter">
                            <template v-if="Ifields[ifield].filter.slot">
                                <slot :name="Ifields[ifield].filter.slot"></slot>
                            </template>
                            <template v-else-if="Ifields[ifield].filter == true || Ifields[ifield].filter.type == 'input'">
                                <input :placeholder="Ifields[ifield].filter.placeholder" type="text" v-model="IfilterValues[ifield]" v-on:change="calcRows" />
                            </template>
                            <template v-else-if="Ifields[ifield].filter.type == 'select'">
                                <select v-model="IfilterValues[ifield]" v-on:change="calcRows">
                                    <option value=""></option>
                                    <option v-for="(oName, oKey) in Ifields[ifield].filter.options" :value="oKey">{{oName}}</option>
                                </select>
                            </template>
                        </template>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row,index) in Irows" :class="[(IcheckedRows.indexOf(index) >= 0) ? 'check-row' :'' ]">
                    <td v-if="checkRows">
                        <input type="checkbox" v-model="IcheckedRows" :value="index"/>
                    </td>
                    <template v-for="ifield in IshowFields">
                        <template v-if="Ifields[ifield].editable && IrowEditable[row[rowId]] && IrowEditable[row[rowId]][ifield]">
                            <td v-if="Ifields[ifield].editable.slot" class="cell-edit">
                                <slot :name="Ifields[ifield].filter.slot"></slot>
                            </td>
                            <td v-else :key="ifield" class="cell-edit" >
                                <input 
                                    type="text"  
                                    class="cell-edit-input"
                                    :value="row[ifield]" 
                                    :data-row-id="row[rowId]" 
                                    :data-field="ifield" 
                                    :data-index="index" 
                                />
                                <div class="btn-cell-edit-ok" :click="cellChangeSave" ></div>
                                <div class="btn-cell-edit-cancel" :click="cellChangeCancel"></div>
                            </td>
                        </template>
                        <template v-else >
                            <td v-if="Ifields[ifield].slot" :class="ifield">
                                <slot :name="Ifields[ifield].slot" :value="row[ifield]" :item="row" :index="index"></slot>
                            </td>
                            <td v-else
                                :key="ifield"
                                v-html="row[ifield]"
                                @dblclick="editCell(row[rowId],ifield, index)"
                            ></td>
                        </template>
                    </template>
                </tr>
            </tbody>
            <tfoot>
            <tr>
                <td :colspan="Object.keys(fields).length">
                    <div>total: {{ItotalRows}}</div>
                    <div>
                        por pagina:
                        <select v-model="IperPage">
                            <option v-for="pp in IperPageOptions" :value="pp">{{pp}}</option>
                        </select>
                        <select v-model="Ipage">
                            <option v-for="pp in ItotalPages" :value="pp">{{pp}}</option>
                        </select>
                    </div>
                </td>
            </tr>
            <tr>
                <td :colspan="Object.keys(fields).length">
                    <div>
                        <select v-model="IshowFields" multiple>
                            <option 
                                v-for="(field,ifield) in fields" 
                                :value="ifield" 
                                v-if="field.status != 'none' && field.status != 'fix'"
                            >
                                {{field.label}}
                            </option>
                        </select>
                    </div>
                </td>
            </tr>
            </tfoot>
        </table>
    </div>
</template>

<script>
export default {
    props: {
        fields: Object,
        rows: Array,
        page: {
            type: Number,
            default: 1
        },
        perPage: {
            type: Number,
            default: 10
        },
        perPageOptions: {
            type: Array,
            default() {return [5,10,25,50,100]}
        },
        orderBy: {
            type: String,
            default: ''
        },
        order: {
            type: String,
            default: ''
        },
        config: {
            type: Object,
            //default: {}
            default() {return {}}
        },
        rowId: {
            type: String,
        },
        checkRows: Boolean,
        
         
    },
    data() {
        return {
            IperPage: this.perPage || 10,
            Ipage: this.page || 1,
            IperPageOptions: this.perPageOptions || [10,25,50,100],
            Ifields: this.fields || {},
            Irows: this.rows || [],
            ItotalPages: 0,
            ItotalRows: 0,
            IfilterValues:{},
            IorderBy: this.orderBy || '',
            Iorder: this.IorderBy  || '',
            IshowFields:[],
            IcheckedRowsToggle: false,
            IcheckedRows:[],
            Iconfig: this.config || {
                IfilterValues:{},
                IshowFields:[],
                IorderBy: this.orderBy || '',
                Iorder: this.order  || '',
                IperPage: this.page || 1,
                Ipage: this.page || 1
            },
            IrowEditable: [],
            IcolumnInMove: '',
        }
    },
    mounted() {
        this.IperPage = this.perPage,
        this.Ipage = this.page,
        this.IperPageOptions = this.perPageOptions,
        this.IorderBy = this.orderBy,
        this.Iorder = this.order,
        this.calcBaseShowFields()
        this.calcFields()
        this.calcRows()
    },
    methods:{
        handleDragStart(e) {
            //e.target.style.opacity = '0.4';  // this / e.target is the source node.
            e.target.classList.add('item-drag');
            this.IcolumnInMove = e.target.dataset.key;  // See the section on the DataTransfer object.
        },
        handleDragOver(e) {
            if (e.preventDefault) {
                e.preventDefault(); // Necessary. Allows us to drop.
            }
            
            e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
            return false;
        },
        handleDragEnter(e) {
            // this / e.target is the current hover target.
            e.target.classList.add('over');
        },
        handleDragLeave(e) {
            e.target.classList.remove('over');  // this / e.target is previous target element.
        },
        handleDrop(e) {
            //ONDE SE LARGA
            console.log(e);
            // this / e.target is current target element.

            if (e.stopPropagation) {
                e.stopPropagation(); // stops the browser from redirecting.
            }

            // See the section on the DataTransfer object.
            console.log("coloca o: " + this.IcolumnInMove + " depois de: "+ e.target.dataset.key);
            this.reorderFields(this.IcolumnInMove, e.target.dataset.key);
            return false;
        },
        handleDragEnd(e) {
            //QUANDO LARGADO
            // this/e.target is the source node.
            e.target.classList.remove('item-drag');
            var  cols = e.target.parentNode.querySelectorAll('th.over');
            [].forEach.call(cols, function (col) {
                col.classList.remove('over');
            });
        },
        checkedRowsToggle(){
            if(this.IcheckedRowsToggle){
                this.IcheckedRows = Object.keys(this.Irows)
            }else{
                this.IcheckedRows = []
            }
        },
        editCell(rowId,key,index){
            this.IrowEditable[rowId] = [];
            this.IrowEditable[rowId][key]= true;
            this.IcheckedRows = [index];
            this.$forceUpdate();
        },
        cellChangeCancel(evnt){
            var rowId = evnt.target.dataset.rowId;
            var field = evnt.target.dataset.field;
            var index = evnt.target.dataset.index;
            var value = evnt.target.value;

            this.IcheckedRows = [];
            if(this.Irows[index][this.rowId] == rowId ) this.Irows[index][field] = value;
            this.IrowEditable[rowId][field] = false;
            this.$forceUpdate();
        },
        cellChangeSave(evnt){
            var rowId = evnt.target.dataset.rowId;
            var field = evnt.target.dataset.field;
            var index = evnt.target.dataset.index;
            var value = evnt.target.value;

            this.IcheckedRows = [];
            if(this.Irows[index][this.rowId] == rowId ) this.Irows[index][field] = value;
            this.IrowEditable[rowId][field] = false;
            this.$forceUpdate();
        },
        colOrdering(namesepace){
            this.IorderBy = namesepace;
            this.Iorder = (this.Iorder == 'DESC') ? 'ASC' : 'DESC';
            this.calcRows();
        },
        filterRows(rows, IfilterValues, Ifields) {
            var totalFilter = Object.keys(IfilterValues).map(key => IfilterValues[key]).filter(Boolean).length;
            if( totalFilter > 0){
                rows = rows.filter(function(IfilterValues,Ifields,element) {
                    var itemOK = 0;
                    for(var index in IfilterValues) { 
                        if( element[index] !='' && Ifields[index].filter){
                            if(typeof Ifields[index].filter.logic == 'function'){
                                if(Ifields[index].filter.logic(IfilterValues[index], element[index], element)){
                                    itemOK++;
                                }
                            }else{
                                if (Ifields[index].filter === true || Ifields[index].filter.logic == 'like'){
                                    if (IfilterValues[index] instanceof RegExp) {
                                        var regex = IfilterValues[index];
                                    } else {
                                        var regex = new RegExp('.*' + IfilterValues[index] + '.*', 'ig');
                                    }
                                    if(regex.test(element[index])){
                                        itemOK++;
                                    }
                                }else if (Ifields[index].filter.logic == 'equal'){ 
                                    if(element[index].toLowerCase() == IfilterValues[index].toLowerCase()){
                                        itemOK++;
                                    }
                                }
                            }
                        }
                    }
                    return (itemOK == totalFilter);
                }.bind( null, IfilterValues, Ifields ));
            }
            return rows;
        },
        orderRows(tmp, orderBy, order) {
            if( orderBy == '' || order =='') return tmp;
            return tmp.sort(function(orderBy, order, a,b) {
                var _a = a[orderBy],
                    _b = b[orderBy],
                    invert = (order == 'ASC') ? 1 : 0;
                return (invert) ? 
                    _b.localeCompare(_a, undefined, {numeric: true, sensitivity: 'base'}) : 
                    _a.localeCompare(_b, undefined, {numeric: true, sensitivity: 'base'});
            }.bind(null, orderBy, order) ); 
            
        },
        calcRows() {
            self = this;
            self.Iconfig.IfilterValues = this.IfilterValues;
            self.Iconfig.IperPage = this.IperPage;
            self.Iconfig.Ipage = this.Ipage;
            self.Iconfig.Iorder = this.Iorder;
            self.Iconfig.IorderBy = this.IorderBy;
            
            var tmp = this.rows;
            tmp = self.filterRows(tmp, this.IfilterValues, this.Ifields);
            self.orderRows(tmp, self.IorderBy, self.Iorder);
            this.ItotalRows = tmp.length;
            this.ItotalPages = Math.ceil(this.ItotalRows / this.IperPage);
            var tmp = (typeof tmp != 'undefined') ? tmp.slice((this.Ipage - 1) * this.IperPage, Number((this.Ipage) * this.IperPage)) : [];
            return this.Irows = tmp;
        },
        calcBaseShowFields() {
            for (var name in this.fields) {
                if (this.fields.hasOwnProperty(name)) {
                    var info = this.fields[name];
                    if( info.hasOwnProperty('status') ){
                        if( info.status == 'hide' || info.status == 'none' ){
                            continue;
                        }
                    }
                    this.IshowFields.push(name);
                }
            }
            console.log('calcBaseShowFields');
            console.log(this.IshowFields);
        },
        reorderFields(field,afterField) {
            var index_field = this.IshowFields.indexOf(field);
            var index_afterField = this.IshowFields.indexOf(afterField);
            if (index_field >= 0) {
                this.IshowFields.splice(index_field, 1);
                this.IshowFields.splice(index_afterField , 0,field);
            }

            this.calcFields();
            this.$forceUpdate();
            
        },
        calcFields() {
            var tmp = {};
            this.Iconfig.IshowFields = this.IshowFields;
            for (var name in this.fields) {
                if (this.fields.hasOwnProperty(name)) {
                    var info = this.fields[name];
                    if( info.hasOwnProperty('status') ){
                        if( info.status == 'none' ){
                            continue;
                        }else if( info.status == 'fix' ){
                            tmp[name] = info;
                        }
                    }
                    if( this.IshowFields.indexOf(name) > -1 ){
                        tmp[name] = info;
                    }
                    
                }
            }
            this.Ifields = tmp;
        },
    },
    watch: {
        rows(newVal, oldVal) {
            if (newVal === this.rows && oldVal.length > 0) {
                return;
            }
            this.calcRows();
        },
        page(newVal, oldVal) {
            if (newVal === this.Ipage) {
                return;
            }
            this.Ipage = newVal || null;
            this.calcRows();
        },
        Ipage(newVal, oldVal) {
            this.calcRows();
        },
        perPage(newVal, oldVal) {
            if (newVal === this.IperPage) {
                return;
            }
            this.IperPage = newVal || null;
            this.calcRows();
        },
        IperPage(newVal, oldVal) {
            this.calcRows();
        },
        orderBy(newVal, oldVal) {
            if (newVal === this.orderBy) {
                return;
            }
            this.orderBy = newVal || null;
            this.calcRows();
        },
        IorderBy(newVal, oldVal) {
            this.calcRows();
        },
        order(newVal, oldVal) {
            if (newVal === this.order) {
                return;
            }
            this.order = newVal || null;
            this.calcRows();
        },
        Iorder(newVal, oldVal) {
            this.calcRows();
        },
        IshowFields(){
            this.calcFields()
            this.$forceUpdate();
        },
        IcheckedRowsToggle() {
            this.checkedRowsToggle()
        }
    }
}
</script>
<style scoped>
th.col-order{
    position: relative
}
th.col-order:before,
th.col-order:after {
    position: absolute;
    bottom: .45em;
    display: block;
    opacity: .3;
}
th.col-order:after {
    content:'\2193';
    right: .5em;
}
th.col-order:before {
    content:'\2191';
    right: 1em;
}
th.col-order.asc:before {
    opacity: 1;
}
th.col-order.desc:after {
    opacity: 1;
}
.btn-cell-edit-ok:after {
    content: '\21B5';
    cursor: pointer;
}
.btn-cell-edit-cancel:after {
    content: '\2297';
    cursor: pointer;
}
td.cell-edit{
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -moz-box-orient: horizontal;
    -webkit-box-direction: normal;
    -moz-box-direction: normal;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
}
[draggable] {
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  user-select: none;
  /* Required to make elements draggable in old WebKit */
  -khtml-user-drag: element;
  -webkit-user-drag: element;
}
.over{
    background: grey;
}
</style>
