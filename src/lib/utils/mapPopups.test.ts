import { describe, expect, it } from 'vitest';
import { calculatePopupContentMaxHeight, calculatePopupPan } from './mapPopups';

const container = { left: 100, right: 500, top: 200, bottom: 500 };

describe('calculatePopupPan', () => {
	it('does not pan a popup already inside the padded map bounds', () => {
		expect(
			calculatePopupPan(container, { left: 150, right: 350, top: 240, bottom: 460 }, 16)
		).toEqual([0, 0]);
	});

	it('uses MapLibre panBy direction for right and bottom overflow', () => {
		expect(
			calculatePopupPan(container, { left: 350, right: 530, top: 300, bottom: 545 }, 16)
		).toEqual([46, 61]);
	});

	it('uses MapLibre panBy direction for left and top overflow', () => {
		expect(
			calculatePopupPan(container, { left: 80, right: 260, top: 170, bottom: 400 }, 16)
		).toEqual([-36, -46]);
	});
});

describe('calculatePopupContentMaxHeight', () => {
	it('caps oversized content to the padded map height minus popup chrome', () => {
		expect(calculatePopupContentMaxHeight(300, 10, 400, 16)).toBe(258);
	});

	it('leaves content unconstrained when the complete popup already fits', () => {
		expect(calculatePopupContentMaxHeight(400, 10, 200, 16)).toBeNull();
	});
});
