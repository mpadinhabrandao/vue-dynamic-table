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
        dragColumn: Boolean,
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
            if (e.stopPropagation) {
                e.stopPropagation(); // stops the browser from redirecting.
            }

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
                        }else if( info.status == 'fixed' ){
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
