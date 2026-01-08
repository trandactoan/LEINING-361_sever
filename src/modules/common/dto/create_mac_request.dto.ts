export class CreateMacRequestDto {
  amount: string;
  desc: string;
  item: Array<{ id: string; amount: string }>;
  extradata: object;
  method: object;
}
