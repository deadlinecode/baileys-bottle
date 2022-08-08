import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Auth {
  @PrimaryColumn()
  id: number;

  @Column()
  key: string;

  @Column()
  value: string;
}
