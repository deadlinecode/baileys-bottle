import { Column, Entity, PrimaryColumn, Unique } from "typeorm";

@Entity()
@Unique(["DBId", "id"])
export class Contact {
  @PrimaryColumn()
  DBId: number;

  @Column({ unique: true })
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  notify?: string;

  @Column({ nullable: true })
  verifiedName?: string;

  @Column({ nullable: true })
  imgUrl?: string;

  @Column({ nullable: true })
  status?: string;
}
