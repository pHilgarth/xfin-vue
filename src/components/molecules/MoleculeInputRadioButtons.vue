<template>
  <div class="molecule-input-radio-buttons" v-for="option in options" :key="option.id">
    <AtomInputRadioButton :group="group" :id="option.id" :label="option.label" @change="$emit('change', $event)" :checked="preselectedOptionId === option.id"/>
  </div>
</template>

<script>
import AtomInputRadioButton from '@/components/atoms/AtomInputRadioButton';

export default {
  components: {
    AtomInputRadioButton
  },

  emits: [ 'change' ],

  props: {
    group: { type: String, required: true },
    options: { type: Array, required: true },
    preselectedOptionId: { type: String, required: true },
  },
};

</script>