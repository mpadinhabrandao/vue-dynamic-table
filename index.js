import DynTable from './dyn-table.vue'

const DynTablePlugin = {
  install: function(Vue, options) {
    Vue.component('dyn-table', DynTable);
  },
};

export default DynTablePlugin;
export {
   DynTable as VueDynTable
};

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(DynTablePlugin);
}
