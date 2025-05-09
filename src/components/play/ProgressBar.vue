<template>
    <div class="progress-bar">
      <input
        type="range"
        min="0"
        max="100"
        :value="progress"
        @input="$emit('seek', $event.target.value)"
      />
    </div>
  </template>
  
  <script>
  export default {
    props: {
      progress: Number,
    },
  };
  </script>
  
  <style scoped>
  .progress-bar {
    width: 100%;
  }
  </style>