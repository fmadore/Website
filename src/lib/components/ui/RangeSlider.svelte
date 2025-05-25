<!-- Custom Range Slider Component for Svelte 5 -->
<script lang="ts">
    let {
        min = 0,
        max = 100,
        step = 1,
        values = $bindable([min, max]),
        pips = false,
        pipstep = 10,
        first = undefined,
        last = undefined,
        float = false,
        onchange
    }: {
        min?: number;
        max?: number;
        step?: number;
        values?: [number, number];
        pips?: boolean;
        pipstep?: number;
        first?: string;
        last?: string;
        float?: boolean;
        onchange?: (event: CustomEvent<{ values: [number, number] }>) => void;
    } = $props();

    let sliderRef: HTMLDivElement;
    let isDragging = $state<'min' | 'max' | null>(null);
    let showFloats = $state({ min: false, max: false });

    // Calculate positions as percentages
    const minPosition = $derived(((values[0] - min) / (max - min)) * 100);
    const maxPosition = $derived(((values[1] - min) / (max - min)) * 100);    // Generate pip values for display
    const pipValues = $derived.by(() => {
        if (!pips) return [];
        const pipsArray: number[] = [];
        for (let i = min; i <= max; i += pipstep) {
            pipsArray.push(i);
        }
        if (!pipsArray.includes(max)) {
            pipsArray.push(max);
        }
        return pipsArray;
    });

    function getValueFromPosition(clientX: number): number {
        const rect = sliderRef.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const rawValue = min + percentage * (max - min);
        return Math.round(rawValue / step) * step;
    }

    function updateValue(type: 'min' | 'max', newValue: number) {
        let newValues: [number, number];
        
        if (type === 'min') {
            newValues = [Math.min(newValue, values[1]), values[1]];
        } else {
            newValues = [values[0], Math.max(newValue, values[0])];
        }

        values = newValues;
        
        // Dispatch change event
        if (onchange) {
            onchange(new CustomEvent('change', { detail: { values: newValues } }));
        }
    }

    function handleMouseDown(event: MouseEvent, type: 'min' | 'max') {
        event.preventDefault();
        isDragging = type;
        showFloats[type] = float;

        function handleMouseMove(event: MouseEvent) {
            if (!isDragging) return;
            const newValue = getValueFromPosition(event.clientX);
            updateValue(isDragging, newValue);
        }

        function handleMouseUp() {
            isDragging = null;
            showFloats.min = false;
            showFloats.max = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleTrackClick(event: MouseEvent) {
        if (isDragging) return;
        
        const newValue = getValueFromPosition(event.clientX);
        const distanceToMin = Math.abs(newValue - values[0]);
        const distanceToMax = Math.abs(newValue - values[1]);
        
        // Update the closest handle
        if (distanceToMin <= distanceToMax) {
            updateValue('min', newValue);
        } else {
            updateValue('max', newValue);
        }
    }

    function handleKeyDown(event: KeyboardEvent, type: 'min' | 'max') {
        let newValue = values[type === 'min' ? 0 : 1];
        
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowDown':
                event.preventDefault();
                newValue = Math.max(min, newValue - step);
                break;
            case 'ArrowRight':
            case 'ArrowUp':
                event.preventDefault();
                newValue = Math.min(max, newValue + step);
                break;
            case 'Home':
                event.preventDefault();
                newValue = min;
                break;
            case 'End':
                event.preventDefault();
                newValue = max;
                break;
            default:
                return;
        }
        
        updateValue(type, newValue);
    }
</script>

<div class="range-slider" bind:this={sliderRef}>
    <!-- Track -->
    <div 
        class="range-track" 
        onclick={handleTrackClick}
        role="presentation"
    >
        <!-- Active range highlight -->
        <div 
            class="range-highlight"
            style="left: {minPosition}%; width: {maxPosition - minPosition}%"
        ></div>
    </div>

    <!-- Min handle -->
    <div 
        class="range-handle"
        class:active={isDragging === 'min'}
        style="left: {minPosition}%"
        role="slider"
        tabindex="0"
        aria-valuemin={min}
        aria-valuemax={values[1]}
        aria-valuenow={values[0]}
        aria-label="Minimum value"
        onmousedown={(e) => handleMouseDown(e, 'min')}
        onkeydown={(e) => handleKeyDown(e, 'min')}
        onfocus={() => showFloats.min = float}
        onblur={() => showFloats.min = false}
    >
        {#if showFloats.min}
        <div class="range-float">{values[0]}</div>
        {/if}
    </div>

    <!-- Max handle -->
    <div 
        class="range-handle"
        class:active={isDragging === 'max'}
        style="left: {maxPosition}%"
        role="slider"
        tabindex="0"
        aria-valuemin={values[0]}
        aria-valuemax={max}
        aria-valuenow={values[1]}
        aria-label="Maximum value"
        onmousedown={(e) => handleMouseDown(e, 'max')}
        onkeydown={(e) => handleKeyDown(e, 'max')}
        onfocus={() => showFloats.max = float}
        onblur={() => showFloats.max = false}
    >
        {#if showFloats.max}
        <div class="range-float">{values[1]}</div>
        {/if}
    </div>

    <!-- Pips -->
    {#if pips}
    <div class="range-pips">
        {#each pipValues as pipValue}
        {@const pipPosition = ((pipValue - min) / (max - min)) * 100}
        <div 
            class="pip"
            class:pip-large={pipValue === min || pipValue === max || pipValue % (pipstep * 2) === 0}
            style="left: {pipPosition}%"
        ></div>
        {#if (first === 'label' && pipValue === min) || (last === 'label' && pipValue === max) || pipValue % (pipstep * 2) === 0}
        <div 
            class="range-label"
            style="left: {pipPosition}%"
        >
            {pipValue}
        </div>
        {/if}
        {/each}
    </div>
    {/if}
</div>

<style>
    .range-slider {
        position: relative;
        height: 40px;
        width: 100%;
        margin: 10px 0;
    }

    .range-track {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 4px;
        background-color: var(--color-border, #e2e8f0);
        border-radius: 2px;
        transform: translateY(-50%);
        cursor: pointer;
    }

    .range-highlight {
        position: absolute;
        top: 0;
        height: 100%;
        background-color: var(--color-primary, #3b82f6);
        border-radius: 2px;
        pointer-events: none;
    }

    .range-handle {
        position: absolute;
        top: 50%;
        width: 16px;
        height: 16px;
        background-color: var(--color-primary, #3b82f6);
        border: 2px solid white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        cursor: grab;
        transition: all 0.15s ease;
        z-index: 2;
    }

    .range-handle:hover,
    .range-handle:focus {
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary, #3b82f6) 30%, transparent);
        outline: none;
    }

    .range-handle.active {
        cursor: grabbing;
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary, #3b82f6) 40%, transparent);
        scale: 1.1;
    }

    .range-float {
        position: absolute;
        bottom: 120%;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--color-primary, #3b82f6);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: var(--font-size-xs, 0.75rem);
        white-space: nowrap;
        pointer-events: none;
    }

    .range-float::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: var(--color-primary, #3b82f6);
    }

    .range-pips {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        height: 20px;
        margin-top: 5px;
    }

    .pip {
        position: absolute;
        width: 1px;
        height: 5px;
        background-color: var(--color-text-light, #6b7280);
        transform: translateX(-50%);
    }

    .pip.pip-large {
        height: 8px;
        background-color: var(--color-text, #374151);
    }

    .range-label {
        position: absolute;
        top: 10px;
        transform: translateX(-50%);
        font-size: var(--font-size-xs, 0.75rem);
        color: var(--color-text-light, #6b7280);
        white-space: nowrap;
    }
</style>
