export class Keyframe {
  constructor(
    public time: number,
    public value: number,
    public easing: string = 'linear',
  ) {}
}
