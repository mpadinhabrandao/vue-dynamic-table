<template>
    <div :class="Iclass.class">
        {{Iconfig}}
        <table :class="Iclass.table.class">
            <thead :class="Iclass.table.thead.class">
                <tr :class="Iclass.table.thead.tr.class">
                    <th v-for="(field, ifield) in Ifields"  :class=" [Iclass.table.thead.tr.th.class,ifield,{ 'col-order' : field.sortable }, (ifield == IorderBy) ? ((Iorder == 'DESC') ? 'desc' : 'asc'): '']" @click="colOrdering(ifield)">
                        {{field.label}}
                    </th>
                </tr>
                <tr :class="Iclass.table.thead.tr.class">
                    <th v-for="(field, ifield) in Ifields" :class=" [Iclass.table.thead.tr.th.class,ifield]">
                        <template v-if="field.filter">
                            <template v-if="field.filter.slot">
                            <slot :name="field.filter.slot"></slot>
                            </template>
                            <template v-else-if="field.filter == true || field.filter.type == 'input'">
                                <input :placeholder="field.filter.placeholder" type="text" v-model="IfilterValues[ifield]" v-on:change="calcRows" />
                            </template>
                            <template v-else-if="field.filter.type == 'select'">
                                <select v-model="IfilterValues[ifield]" v-on:change="calcRows">
                                    <option value=""></option>
                                    <option v-for="(oName, oKey) in field.filter.options" :value="oKey">{{oName}}</option>
                                </select>
                            </template>
                        </template>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row,index) in Irows">
                    <template v-for="(item, key) in Ifields">
                        <template v-if="item.editable && IrowEditable[row[rowId]] && IrowEditable[row[rowId]][key]">
                            <td :key="key" >
                                <input type="text"  v-model="row[key]" v-on:change="cellCange" :data-row-id="row[rowId]" :data-field="key" />
                                <input type="button" v-on:click="cancelChange" />
                            </td>
                        </template>
                        <template v-else >
                            <td v-if="$scopedSlots[key]" :class="key">
                                <slot :name="key" :value="row[key]" :item="row" :index="index"></slot>
                            </td>
                            <td v-else
                                :key="key"
                                v-html="row[key]"
                                @dblclick="editCell(row[rowId],key)"
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
    updated() {
        //console.log(this);
    },
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
            default: {}
        }
        
         
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
            Iconfig: this.config || {
                IfilterValues:{},
                IshowFields:[],
                IorderBy: this.orderBy || '',
                Iorder: this.order  || '',
                IperPage: this.page || 1,
                Ipage: this.page || 1
            },
            IrowEditable: [],
            rowId: "namespace",
            Iclass: {
                class: "",
                table: {
                    class: "table table-sm",
                    thead: {
                        class: "",
                        tr: {
                            class: "",
                            th: {
                                class: ""
                            }
                        }
                    },
                    tbody: {
                        class: "",
                        tr: {
                            class: "",
                            td: {
                                class: ""
                            }
                        }
                    },
                    tfoot: {
                        class: "",
                        tr: {
                            class: "",
                            td: {
                                class: ""
                            }
                        }
                    }
                }
            }
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
    computed: {
    },
    methods:{
        editCell(rowId,key){
            this.IrowEditable[rowId] = [];
            this.IrowEditable[rowId][key]= true;
            this.$forceUpdate();
        },
        cellCange(evnt){
            var rowId = evnt.target.dataset.rowId;
            var field = evnt.target.dataset.field
            console.log(rowId);
            console.log(field);
            console.log(evnt.target.value);
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
        },
        calcFields(x = false) {
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
</style>
