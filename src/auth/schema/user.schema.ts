
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, } from 'mongoose';


export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
     @Prop({ required: true })
     name: string;
     @Prop({ required: true, unique: true })
     username: string;
     @Prop({ required: true })
     password: string


}

export const UserSchema = SchemaFactory.createForClass(User);